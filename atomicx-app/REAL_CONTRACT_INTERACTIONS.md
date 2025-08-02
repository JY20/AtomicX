# Real Contract Interactions for AtomicX

## 🚀 Implementation Overview

The AtomicX application has been updated to trigger real blockchain wallet interactions while maintaining a fallback to mock implementations if the real transactions fail. This approach ensures:

1. **Real User Experience**: Users see actual MetaMask and ArgentX/Braavos wallet popups
2. **Contract Interaction**: The app attempts to interact with the real contracts
3. **Graceful Fallbacks**: If contracts aren't deployed or errors occur, the app falls back to mock data
4. **End-to-End Flow**: The entire atomic swap process can be demonstrated regardless of contract status

## 📊 Contract Interactions

### 1️⃣ ETH Deposit (MetaMask Triggered)

```javascript
// Real MetaMask transaction that sends ETH
const tx = await ethSigner.sendTransaction({
  to: HTLC_CONTRACT_ADDRESS,
  value: amountInWei,
  data: ethers.utils.hexlify(ethers.utils.toUtf8Bytes(`Deposit ${amount} ETH with hashlock: ${hashlock}`))
});

// Wait for confirmation
const receipt = await tx.wait(1);
```

- **User Experience**: MetaMask popup appears showing the transaction details
- **Network**: Ethereum Sepolia testnet
- **Result**: Real ETH is sent from user's wallet
- **Fallback**: If transaction fails, app uses mock data to continue the flow

### 2️⃣ Starknet HTLC Creation (ArgentX/Braavos Triggered)

```javascript
// Real Starknet transaction to create HTLC
const tx = await starknetAccount.execute([
  {
    contractAddress: STARKNET_HTLC_ADDRESS,
    entrypoint: "create_htlc",
    calldata: [
      hashlock,
      recipient,
      STRK_TOKEN_ADDRESS,
      amountU256.low,
      amountU256.high,
      timelock
    ]
  }
]);
```

- **User Experience**: Starknet wallet popup appears showing the transaction details
- **Network**: Starknet Sepolia testnet
- **Result**: Real contract call is attempted
- **Fallback**: If transaction fails, app generates a mock HTLC ID to continue the flow

### 3️⃣ STRK Token Claim (ArgentX/Braavos Triggered)

```javascript
// Real Starknet transaction to withdraw tokens
const tx = await starknetAccount.execute([
  {
    contractAddress: STARKNET_HTLC_ADDRESS,
    entrypoint: "withdraw",
    calldata: [
      htlcId,
      secret
    ]
  }
]);
```

- **User Experience**: Starknet wallet popup appears showing the withdrawal details
- **Network**: Starknet Sepolia testnet
- **Result**: Real contract call is attempted
- **Fallback**: If transaction fails, app simulates successful withdrawal

## 🔄 Complete Cross-Chain Flow

1. **User Connects Wallets**:
   - Ethereum wallet (MetaMask) on Sepolia
   - Starknet wallet (ArgentX/Braavos) on Sepolia

2. **User Initiates Swap**:
   - Enters ETH amount (e.g., 0.01 ETH)
   - App calculates STRK amount (e.g., 2,600 STRK)
   - Clicks "Create Cross-Chain Swap"

3. **ETH Deposit (Step 1)**:
   - MetaMask popup appears for approval
   - User approves transaction
   - ETH is sent to contract (or fallback mock is used)

4. **STRK HTLC Creation (Step 2)**:
   - Starknet wallet popup appears for approval
   - User approves transaction
   - HTLC is created (or fallback mock is used)
   - Secret and hashlock are stored for claiming

5. **Claim STRK Tokens (Step 3)**:
   - User clicks "Claim STRK Tokens"
   - Starknet wallet popup appears for approval
   - User approves transaction
   - Tokens are claimed (or fallback mock is used)
   - Swap is marked complete

## 🛠️ Technical Implementation

### Wallet Triggers

- **ETH Transactions**: Use `ethers.js` to trigger MetaMask
- **Starknet Transactions**: Use `starknet.js` to trigger ArgentX/Braavos
- **Error Handling**: Catch wallet rejections and network errors
- **Fallbacks**: Provide mock data if real transactions fail

### Contract Addresses

- **ETH HTLC**: Uses `HTLC_CONTRACT_ADDRESS` from config
- **STRK HTLC**: Uses `STARKNET_HTLC_ADDRESS` from config
- **STRK Token**: Uses `STRK_TOKEN_ADDRESS` from config
- **Fallbacks**: Uses placeholder addresses if contracts not configured

### Security Considerations

- **Transaction Signing**: All transactions require user approval in wallet
- **Secret Management**: Secret key is stored in localStorage for demo purposes
- **Error Handling**: Graceful fallbacks for all error scenarios

## 📋 Testing Guide

1. **Connect Both Wallets**:
   - Ensure MetaMask is on Sepolia
   - Ensure Starknet wallet is on Sepolia

2. **Create Swap**:
   - Enter 0.01 ETH amount
   - Click "Create Cross-Chain Swap"
   - Approve MetaMask transaction
   - Approve Starknet transaction

3. **Claim Tokens**:
   - Click "Claim STRK Tokens"
   - Approve Starknet transaction

4. **Verify Console**:
   - Check for real transaction hashes
   - Look for fallback messages if transactions failed

## 🔍 Debugging

- **Console Logs**: All steps are logged with detailed information
- **Transaction Status**: Success/failure is tracked and displayed
- **Fallback Indicators**: `🎭 FALLBACK:` prefix indicates mock data is being used
- **Wallet Errors**: Common wallet errors are handled and explained to users

## 🚧 Known Limitations

1. **Contract Deployment**: If contracts are not deployed, fallback mock data will be used
2. **Token Approval**: Current implementation doesn't handle STRK token approvals
3. **Gas Estimation**: Fixed gas estimates are used instead of dynamic calculation
4. **Network Switching**: Manual network switching is required if on wrong network

## 🔮 Future Improvements

1. **Token Approvals**: Add STRK token approval step before HTLC creation
2. **Dynamic Gas**: Implement dynamic gas estimation based on network conditions
3. **Contract Verification**: Add more robust contract existence checks
4. **Network Auto-Switch**: Implement automatic network switching requests
5. **Transaction History**: Store and display past atomic swaps