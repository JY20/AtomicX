use starknet::ContractAddress;
use core::integer::u256;

#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct HTLC {
    sender: ContractAddress,
    recipient: ContractAddress,
    token: ContractAddress,
    amount: u256,
    hashlock: felt252,
    timelock: u64,
    withdrawn: bool,
    refunded: bool,
    created_at: u64,
}

#[starknet::interface]
pub trait IHTLC<TContractState> {
    fn create_htlc(
        ref self: TContractState,
        hashlock: felt252,
        recipient: ContractAddress,
        token: ContractAddress,
        amount: u256,
        timelock: u64
    ) -> felt252;
    
    fn withdraw(ref self: TContractState, htlc_id: felt252, secret: felt252);
    
    fn refund(ref self: TContractState, htlc_id: felt252);
    
    fn get_htlc(self: @TContractState, htlc_id: felt252) -> HTLC;
}

// Define the ERC20 interface
#[starknet::interface]
trait IERC20<TContractState> {
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
    fn transferFrom(ref self: TContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool;
    fn balanceOf(self: @TContractState, account: ContractAddress) -> u256;
}

#[starknet::contract]
mod StarknetHTLC {
    use super::{HTLC, IERC20DispatcherTrait, IERC20Dispatcher};
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp, get_contract_address, storage::{Map, StorageMapReadAccess, StorageMapWriteAccess}};
    use core::hash::HashStateTrait;
    use core::poseidon::PoseidonTrait;
    use core::integer::u256;

    #[storage]
    struct Storage {
        htlcs: Map::<felt252, HTLC>,
        next_htlc_id: felt252,
    }
    
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        HTLCCreated: HTLCCreated,
        HTLCWithdrawn: HTLCWithdrawn,
        HTLCRefunded: HTLCRefunded,
    }
    
    #[derive(Drop, starknet::Event)]
    struct HTLCCreated {
        htlc_id: felt252,
        sender: ContractAddress,
        recipient: ContractAddress,
        token: ContractAddress,
        amount: u256,
        hashlock: felt252,
        timelock: u64,
    }
    
    #[derive(Drop, starknet::Event)]
    struct HTLCWithdrawn {
        htlc_id: felt252,
        secret: felt252,
    }
    
    #[derive(Drop, starknet::Event)]
    struct HTLCRefunded {
        htlc_id: felt252,
    }
    
    #[constructor]
    fn constructor(ref self: ContractState) {
        self.next_htlc_id.write(1);
    }
    
    #[abi(embed_v0)]
    impl HTLCImpl of super::IHTLC<ContractState> {
        fn create_htlc(
            ref self: ContractState,
            hashlock: felt252,
            recipient: ContractAddress,
            token: ContractAddress,
            amount: u256,
            timelock: u64
        ) -> felt252 {
            // Get caller address
            let sender = get_caller_address();
            
            // Get current timestamp
            let current_time = get_block_timestamp();
            
            // Get next HTLC ID
            let htlc_id = self.next_htlc_id.read();
            
            // Create HTLC
            let htlc = HTLC {
                sender,
                recipient,
                token,
                amount,
                hashlock,
                timelock,
                withdrawn: false,
                refunded: false,
                created_at: current_time,
            };
            
            // Store HTLC
            self.htlcs.write(htlc_id, htlc);
            
            // Increment next HTLC ID
            self.next_htlc_id.write(htlc_id + 1);
            
            // Transfer tokens from sender to contract
            let token_contract = IERC20Dispatcher { contract_address: token };
            let contract_address = get_contract_address();
            let transfer_success = token_contract.transferFrom(sender, contract_address, amount);
            assert(transfer_success, 'Token transfer failed');
            
            // Emit event
            self.emit(
                HTLCCreated {
                    htlc_id,
                    sender,
                    recipient,
                    token,
                    amount,
                    hashlock,
                    timelock,
                }
            );
            
            htlc_id
        }
        
        fn withdraw(ref self: ContractState, htlc_id: felt252, secret: felt252) {
            // Get caller address
            let caller = get_caller_address();
            
            // Get HTLC
            let htlc = self.htlcs.read(htlc_id);
            
            // Check if HTLC exists
            assert(htlc.sender.into() != 0, 'HTLC does not exist');
            
            // Check if caller is recipient
            assert(caller == htlc.recipient, 'Caller is not recipient');
            
            // Check if HTLC has not been withdrawn or refunded
            assert(!htlc.withdrawn, 'HTLC already withdrawn');
            assert(!htlc.refunded, 'HTLC already refunded');
            
            // Verify secret
            let mut hash_state = PoseidonTrait::new();
            hash_state = hash_state.update(secret);
            let secret_hash = hash_state.finalize();
            assert(secret_hash == htlc.hashlock, 'Invalid secret');
            
            // Mark HTLC as withdrawn
            let updated_htlc = HTLC {
                sender: htlc.sender,
                recipient: htlc.recipient,
                token: htlc.token,
                amount: htlc.amount,
                hashlock: htlc.hashlock,
                timelock: htlc.timelock,
                withdrawn: true,
                refunded: false,
                created_at: htlc.created_at,
            };
            self.htlcs.write(htlc_id, updated_htlc);
            
            // Transfer tokens to recipient
            let token_contract = IERC20Dispatcher { contract_address: htlc.token };
            let transfer_success = token_contract.transfer(htlc.recipient, htlc.amount);
            assert(transfer_success, 'Token transfer failed');
            
            // Emit event
            self.emit(HTLCWithdrawn { htlc_id, secret });
        }
        
        fn refund(ref self: ContractState, htlc_id: felt252) {
            // Get caller address
            let caller = get_caller_address();
            
            // Get current timestamp
            let current_time = get_block_timestamp();
            
            // Get HTLC
            let htlc = self.htlcs.read(htlc_id);
            
            // Check if HTLC exists
            assert(htlc.sender.into() != 0, 'HTLC does not exist');
            
            // Check if caller is sender
            assert(caller == htlc.sender, 'Caller is not sender');
            
            // Check if HTLC has not been withdrawn or refunded
            assert(!htlc.withdrawn, 'HTLC already withdrawn');
            assert(!htlc.refunded, 'HTLC already refunded');
            
            // Check if timelock has expired
            assert(htlc.timelock + htlc.created_at < current_time, 'Timelock not expired');
            
            // Mark HTLC as refunded
            let updated_htlc = HTLC {
                sender: htlc.sender,
                recipient: htlc.recipient,
                token: htlc.token,
                amount: htlc.amount,
                hashlock: htlc.hashlock,
                timelock: htlc.timelock,
                withdrawn: false,
                refunded: true,
                created_at: htlc.created_at,
            };
            self.htlcs.write(htlc_id, updated_htlc);
            
            // Transfer tokens back to sender
            let token_contract = IERC20Dispatcher { contract_address: htlc.token };
            let transfer_success = token_contract.transfer(htlc.sender, htlc.amount);
            assert(transfer_success, 'Token transfer failed');
            
            // Emit event
            self.emit(HTLCRefunded { htlc_id });
        }
        
        fn get_htlc(self: @ContractState, htlc_id: felt252) -> HTLC {
            self.htlcs.read(htlc_id)
        }
    }
} 