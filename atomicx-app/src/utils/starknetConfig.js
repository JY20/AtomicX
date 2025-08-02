// Starknet HTLC Contract Configuration
export const hash = '0x0155ab7496dede9306cac15b61c76346db5d30ead2d7b70e55877b679fec5bea';
export const STARKNET_HTLC_ADDRESS = '0x028cd39a0ba1144339b6d095e6323b994ed836d92dc160cb36150bf84724317d';

// Token addresses on Starknet Sepolia
export const ETH_TOKEN_ADDRESS = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'; // ETH token on Starknet
export const STRK_TOKEN_ADDRESS = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d'; // STRK token on Starknet Sepolia

export const STARKNET_HTLC_ABI = [
  {
    "type": "function",
    "name": "create_htlc", 
    "inputs": [
      {"name": "hashlock", "type": "core::felt252"},
      {"name": "recipient", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "token", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "amount", "type": "core::integer::u256"},
      {"name": "timelock", "type": "core::integer::u64"}
    ],
    "outputs": [{"type": "core::felt252"}],
    "state_mutability": "external"
  },
  {
    "type": "function",
    "name": "withdraw",
    "inputs": [
      {"name": "htlc_id", "type": "core::felt252"},
      {"name": "secret", "type": "core::felt252"}
    ],
    "outputs": [],
    "state_mutability": "external"
  },
  {
    "type": "function", 
    "name": "refund",
    "inputs": [{"name": "htlc_id", "type": "core::felt252"}],
    "outputs": [],
    "state_mutability": "external"
  },
  {
    "type": "function",
    "name": "get_htlc",
    "inputs": [{"name": "htlc_id", "type": "core::felt252"}],
    "outputs": [{
      "type": "quantmart_contract::StarknetHTLC::HTLC"
    }],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_balance",
    "inputs": [
      {"name": "token_address", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "user_address", "type": "core::starknet::contract_address::ContractAddress"}
    ],
    "outputs": [{"type": "core::integer::u256"}],
    "state_mutability": "view"
  }
];

export const HTLC_EVENTS = {
  HTLCCreated: 'quantmart_contract::StarknetHTLC::StarknetHTLC::HTLCCreated',
  HTLCWithdrawn: 'quantmart_contract::StarknetHTLC::StarknetHTLC::HTLCWithdrawn', 
  HTLCRefunded: 'quantmart_contract::StarknetHTLC::StarknetHTLC::HTLCRefunded'
};