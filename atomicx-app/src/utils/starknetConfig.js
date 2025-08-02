// Starknet HTLC Contract Configuration
export const STARKNET_HTLC_ADDRESS = '0x03825ee6c01c151e0b5eff2ce32776227e4ba79d5e7498c10bb7503d13f74fc9';

// STRK Token address on Starknet Sepolia (placeholder - replace with actual)
export const STRK_TOKEN_ADDRESS = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'; // ETH token on Starknet

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
  }
];

export const HTLC_EVENTS = {
  HTLCCreated: 'quantmart_contract::StarknetHTLC::StarknetHTLC::HTLCCreated',
  HTLCWithdrawn: 'quantmart_contract::StarknetHTLC::StarknetHTLC::HTLCWithdrawn', 
  HTLCRefunded: 'quantmart_contract::StarknetHTLC::StarknetHTLC::HTLCRefunded'
};