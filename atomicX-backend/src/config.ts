import * as dotenv from 'dotenv';
import { Network } from './types';

dotenv.config();

// EVM Networks
export const networks: Record<string, Network> = {
  sepolia: {
    name: 'Sepolia',
    chainId: 11155111,
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://sepolia.drpc.org',
    factoryAddress: '0x46dD29f29FB4816A4E7bd1Dc6458d1dFCA097993', // BTCEscrowFactory address
    explorerUrl: 'https://sepolia.etherscan.io'
  }
};

// Bitcoin Networks
export const bitcoinNetworks = {
  testnet4: {
    name: 'testnet4',
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'tb',
    bip32: {
      public: 0x043587cf,
      private: 0x04358394
    },
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef
  }
};

// Default timelock settings (in seconds)
export const defaultTimelocks = {
  // Immediate withdrawal (0 delay)
  withdrawalPeriod: 0,
  
  // Safety period for refund (1 hour)
  cancellationPeriod: 3600
};

// Bitcoin HTLC timelock (in blocks)
export const bitcoinTimelock = 144; // ~1 day (assuming 10 min blocks)

// Factory ABI (simplified for BTCEscrowFactory)
export const factoryABI = [
  "function createSrcEscrow(tuple(bytes32 orderHash, bytes32 hashlock, uint256 maker, uint256 taker, uint256 token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables) external payable returns (address)",
  "function createDstEscrow(tuple(bytes32 orderHash, bytes32 hashlock, uint256 maker, uint256 taker, uint256 token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables) external payable returns (address)"
];

// Escrow ABI (simplified for BTCEscrowSrc and BTCEscrowDst)
export const escrowABI = [
  "function withdraw(bytes32 secret) external",
  "function cancel() external",
  "function hashlock() external view returns (bytes32)",
  "function orderHash() external view returns (bytes32)",
  "function maker() external view returns (address)",
  "function taker() external view returns (address)",
  "function token() external view returns (address)",
  "function amount() external view returns (uint256)",
  "function safetyDeposit() external view returns (uint256)",
  "function timelocks() external view returns (uint256)"
]; 