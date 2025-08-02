# Contract Update: Starknet HTLC Implementation

## Updated Contract Address

The Starknet HTLC contract has been updated with a new implementation and deployed to:

```
0x03825ee6c01c151e0b5eff2ce32776227e4ba79d5e7498c10bb7503d13f74fc9
```

## Changes Made to Web App

1. Updated the Starknet HTLC contract address in `src/utils/starknetConfig.js`
2. Updated event names to match the new contract namespace (`quantmart_contract` instead of `atomicx_contract`)
3. Updated the HTLC type reference in the ABI

## Key Contract Improvements

The new Starknet HTLC contract includes several important improvements:

### 1. Cross-Chain Hash Compatibility

- Replaced Poseidon hash with Keccak hash for secret verification
- Now compatible with Ethereum's hashing algorithm
- Ensures the same secret can be used on both chains

### 2. Enhanced Input Validation

- Added validation for recipient address (must not be zero)
- Added validation for token address (must not be zero)
- Added validation for amount (must be greater than 0)
- Added validation for timelock (must be greater than 0)

### 3. Improved Timelock Handling

- Added timelock expiration check in the withdraw function
- Enhanced timelock expiration check in the refund function
- Ensures withdraw is only possible before timelock expiration
- Ensures refund is only possible after timelock expiration

### 4. Better Error Messages

- More descriptive error messages for common issues
- Improved error checking for non-existent HTLCs
- Clearer messages about who can perform which actions

## Testing Notes

When testing the atomic swap functionality:

1. Make sure both wallets are connected:
   - Ethereum wallet (MetaMask) on Sepolia testnet
   - Starknet wallet (ArgentX/Braavos) on Starknet Sepolia

2. For the ETH → STRK swap:
   - The ETH deposit will trigger a MetaMask transaction
   - The STRK HTLC creation will trigger a Starknet wallet transaction
   - Both transactions need to succeed for the swap to be created

3. For claiming STRK tokens:
   - The withdraw function will trigger a Starknet wallet transaction
   - The secret used to unlock the HTLC must match the hashlock

4. If any transaction fails:
   - The app will fall back to mock implementation
   - Check the console logs for details about what happened

## Deployment Transaction

The contract was deployed with transaction:
```
0x051921656badc47fb578241026a4b46bdec167f5b344b9ec17b6bc1abad42920
```