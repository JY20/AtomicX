# Cross-Chain Atomic Swap Guide

## Overview

The AtomicX app now supports true cross-chain atomic swaps between Ethereum and Starknet using Hash Time Locked Contracts (HTLCs).

## How It Works

### 1. Prerequisites
- **Ethereum Wallet**: MetaMask connected to Sepolia Testnet
- **Starknet Wallet**: ArgentX or Braavos connected to Starknet Sepolia
- **ETH Balance**: Sufficient ETH for the swap amount + gas fees

### 2. Swap Process

#### Step 1: Setup
1. Connect both Ethereum and Starknet wallets
2. Enter the amount of ETH you want to swap for STRK
3. The app calculates equivalent STRK amount (1 ETH = 3000 STRK)

#### Step 2: Create Cross-Chain HTLCs
1. **Ethereum Side**: ETH is locked in an HTLC on Ethereum Sepolia
2. **Starknet Side**: Corresponding STRK is locked in an HTLC on Starknet Sepolia
3. Both HTLCs use the same secret/hashlock (Poseidon hash)

#### Step 3: Claim Tokens
1. Use the secret to claim STRK tokens on Starknet
2. The same secret can be used to claim ETH on Ethereum (if needed)

## Contract Addresses

### Ethereum Sepolia
- **HTLC Contract**: `0x53195abE02b3fc143D325c29F6EA2c963C8e9fc6`

### Starknet Sepolia  
- **HTLC Contract**: `0x01234adc3b80ce0afda85bcf1e905292096c4f485f3e8d5b4f44a523d2bd9764`
- **STRK Token**: `0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7`

## Security Features

### Atomic Swaps
- **Atomicity**: Either both sides complete or both fail
- **Trustless**: No third party required
- **Time Locks**: 1-hour expiration for safety
- **Secret Sharing**: Same secret unlocks both sides

### Hash Functions
- **Ethereum**: Keccak256 (for compatibility)
- **Starknet**: Poseidon (for efficiency)

## Technical Details

### HTLC Functions

#### Starknet HTLC Contract
```cairo
// Create new HTLC
create_htlc(hashlock, recipient, token, amount, timelock) -> htlc_id

// Withdraw with secret
withdraw(htlc_id, secret)

// Refund after timelock
refund(htlc_id)

// Get HTLC details
get_htlc(htlc_id) -> HTLC
```

### Secret Generation
```javascript
// Generate random secret and Poseidon hash
const { secret, hashlock } = generateHashlock();
```

## Troubleshooting

### Common Issues

1. **"Please connect Starknet wallet"**
   - Install ArgentX or Braavos extension
   - Switch to Starknet Sepolia testnet

2. **"Insufficient balance"**
   - Ensure you have enough ETH for swap + gas
   - Estimated gas: ~0.001 ETH

3. **"Network error"**
   - Check both wallets are on correct testnets
   - Refresh page and try again

4. **"Contract execution failed"**
   - Verify contract addresses
   - Check if HTLCs are still active

### Recovery Options

If a swap fails partially:
1. Check localStorage for swap details
2. Use `refundStarknetHTLC()` after timelock expires
3. Contact support with transaction hashes

## Development

### Local Testing
1. Deploy contracts to testnets
2. Update contract addresses in `starknetConfig.js`
3. Run `npm start` to test locally

### Adding New Tokens
1. Deploy ERC20 token contracts
2. Update `STRK_TOKEN_ADDRESS` in config
3. Modify exchange rate calculations

## Support

For issues or questions:
- Check browser console for error details
- Verify wallet connections and network settings
- Report bugs with transaction hashes when possible