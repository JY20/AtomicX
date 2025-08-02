# AtomicX

AtomicX is a powerful cross-chain platform that enables atomic swaps between Ethereum and Starknet networks using Hash Time Locked Contracts (HTLCs). The platform provides a secure, trustless solution for exchanging assets across different blockchains without intermediaries.

## Overview

AtomicX facilitates secure cross-chain asset exchanges using advanced cryptographic protocols. The platform implements HTLC-based atomic swaps that ensure either both parties receive their assets or the swap is completely reversed, eliminating counterparty risk.

### Key Features

- **Cross-Chain Atomic Swaps**: Secure asset exchanges between Ethereum and Starknet
- **HTLC Implementation**: Time-locked contracts ensuring swap atomicity
- **Trustless Protocol**: No intermediaries or central authorities required
- **Modern Web Interface**: Intuitive React-based UI for seamless user experience
- **Wallet Integration**: Support for Ethereum and Starknet wallets

## Project Structure

This repository contains four main components:

### 1. `atomicX-app/` - Frontend Application
The main web application providing the user interface for atomic swaps.

**Tech Stack:**
- React 19.1.1
- Ethers.js 5.7.2 (Ethereum integration)
- Starknet.js 4.22.0 (Starknet integration)
- React Router for navigation
- Express.js server component

### 2. `atomicX_eth_contract/` - Ethereum Smart Contracts
Solidity smart contracts for Ethereum-side HTLC implementation.

**Deployed Contract:**
- **Network**: Ethereum Sepolia Testnet
- **Address**: `0x53195abE02b3fc143D325c29F6EA2c963C8e9fc6`
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0x53195abe02b3fc143d325c29f6ea2c963c8e9fc6)

### 3. `atomicX_strk_contract/` - Starknet Smart Contracts
Cairo smart contracts for Starknet-side HTLC implementation.

**Tech Stack:**
- Cairo programming language
- Scarb build system
- Starknet Foundry for testing

**Deployed Contract:**
- **Network**: Starknet
- **Address**: `0x01234adc3b80ce0afda85bcf1e905292096c4f485f3e8d5b4f44a523d2bd9764`

### 4. `atomicX-backend/` - Testing & Integration Backend
TypeScript backend for testing contract interactions and HTLC workflows.

**Tech Stack:**
- TypeScript
- Hardhat (Ethereum development)
- Ethers.js and Starknet.js
- Comprehensive testing scripts for swap scenarios

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask or compatible Ethereum wallet
- ArgentX or compatible Starknet wallet

### Frontend Application Setup

```bash
# Navigate to the app directory
cd atomicX-app

# Install dependencies
npm install

# Start the development server
npm start
```

The application will be available at http://localhost:3000.

### Ethereum Contracts Setup

```bash
cd atomicX_eth_contract

# Install dependencies (if package.json exists)
npm install

# Deploy contracts (configure your network settings first)
npx hardhat run deploy-ethereum.ts --network sepolia
```

### Starknet Contracts Setup

```bash
cd atomicX_strk_contract

# Build contracts
scarb build

# Test contracts
scarb test

# Deploy contracts (configure your network settings first)
starkli deploy target/dev/quantmart_contract_StarknetHTLC.contract_class.json
```

### Backend Testing Setup

```bash
cd atomicX-backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Initialize configuration
npm run init

# Run various testing scenarios
npm run maker:create     # Create new swap order
npm run maker:escrow     # Create Ethereum escrow
npm run taker:fund       # Fund Starknet HTLC
npm run maker:claim      # Claim on Starknet
npm run taker:claim      # Claim on Ethereum
```

## Development Workflow

### Complete Atomic Swap Testing

1. **Setup**: Configure wallets and network connections
2. **Create Order**: Initialize swap parameters using backend
3. **Ethereum Escrow**: Deploy HTLC on Ethereum
4. **Starknet Funding**: Fund corresponding HTLC on Starknet
5. **Claim Phase**: Execute claims on both networks
6. **Verification**: Confirm successful asset transfer

### Building for Production

```bash
# Build frontend
cd atomicX-app
npm run build

# Build backend
cd atomicX-backend
npm run build
```

## Network Configuration

### Ethereum
- **Testnet**: Sepolia
- **RPC**: Configure in your environment
- **Required**: ETH for gas fees

### Starknet
- **Network**: Starknet Alpha
- **Required**: ETH for transaction fees

## License

Copyright © 2023 AtomicX. All rights reserved.