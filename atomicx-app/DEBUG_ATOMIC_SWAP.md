# 🔍 Debug Guide: Atomic Swap Not Working

## Issue: "Initiating cross-chain atomic swap..." Gets Stuck

The atomic swap process is getting stuck at the initialization step. Here's how to debug and fix it:

## 🛠️ Debugging Steps

### 1. Open Browser Developer Tools
1. Press `F12` or right-click → "Inspect"
2. Go to **Console** tab
3. Try the swap again
4. Look for error messages with emojis: 🔍 🚀 📤 ❌

### 2. Check Console Output
Look for these specific debug messages:

```
🔍 Debugging wallet connections: { ethAccount: "0x...", starknetAccount: "0x...", ... }
🚀 Starting cross-chain atomic swap: { fromAmount: "0.01", ... }
📤 Attempting ETH deposit to HTLC...
🌐 Current Ethereum network: { chainId: 11155111, name: "sepolia" }
```

### 3. Common Issues & Solutions

#### ❌ **"Ethereum wallet not connected"**
**Solution**: 
- Connect MetaMask
- Switch to **Sepolia Testnet** (not Mainnet!)

#### ❌ **"Starknet wallet not connected properly"**
**Solution**: 
- Install ArgentX or Braavos extension
- Connect to **Starknet Sepolia** testnet
- Refresh the page

#### ❌ **"Wrong network. Please switch to Sepolia testnet"**
**Solution**: 
- In MetaMask: Networks → Sepolia Test Network
- In Starknet wallet: Settings → Networks → Starknet Sepolia

#### ❌ **"HTLC contract not found at address"**
**Solution**: 
- Contract might not be deployed on Sepolia
- Check if contract address `0x53195abE02b3fc143D325c29F6EA2c963C8e9fc6` is correct
- Verify you're on Sepolia testnet (Chain ID: 11155111)

#### ❌ **"Gas estimation failed"**
**Solution**: 
- Check you have enough ETH for gas (need extra ~0.0005 ETH)
- Try with a smaller amount first
- Check if Sepolia testnet is experiencing issues

#### ❌ **"Transaction was rejected in wallet"**
**Solution**: 
- Click "Confirm" in MetaMask popup
- Don't close the transaction popup
- Try again if popup doesn't appear

#### ❌ **"Insufficient balance"**
**Solution**: 
- Get Sepolia testnet ETH from faucet:
  - https://sepoliafaucet.com/
  - https://faucets.chain.link/sepolia
- Wait for faucet transaction to confirm

### 4. Network Requirements

**Ethereum Wallet (MetaMask)**:
- ✅ **Network**: Sepolia Testnet
- ✅ **Chain ID**: 11155111
- ✅ **Balance**: > 0.01 ETH (for 0.01 ETH swap)

**Starknet Wallet (ArgentX/Braavos)**:
- ✅ **Network**: Starknet Sepolia
- ✅ **Connected**: Shows address in app
- ✅ **Active**: Recent transactions work

### 5. Step-by-Step Verification

1. **Check Wallet Connections**:
   ```
   Console should show:
   🔍 Debugging wallet connections: {
     ethAccount: "0x...", ✅
     starknetAccount: "0x...", ✅  
     ethBalance: "0.0109", ✅
     fromAmount: "0.01" ✅
   }
   ```

2. **Check Network**:
   ```
   Console should show:
   🌐 Current Ethereum network: { chainId: 11155111, name: "sepolia" } ✅
   ```

3. **Check Contract**:
   ```
   Console should show:
   📜 Contract code length: > 100 ✅
   ```

4. **Check Gas Estimation**:
   ```
   Console should show:
   ✅ Estimated gas: 250000 (or similar number)
   ```

## 🔧 Quick Fixes

### If Still Not Working:

1. **Refresh Page**: Clear any cached state
2. **Disconnect & Reconnect**: Both wallets
3. **Try Smaller Amount**: Start with 0.001 ETH
4. **Check Faucet ETH**: Get more Sepolia testnet ETH
5. **Wait & Retry**: Network might be congested

### Contract Addresses:
- **ETH HTLC**: `0x53195abE02b3fc143D325c29F6EA2c963C8e9fc6`
- **Starknet HTLC**: `0x01234adc3b80ce0afda85bcf1e905292096c4f485f3e8d5b4f44a523d2bd9764`

## 💡 Pro Tips

1. **Keep Console Open**: Always monitor for errors
2. **Don't Close Popups**: Wait for wallet transaction popups
3. **Check Both Networks**: Verify both testnets are working
4. **Start Small**: Test with minimum amounts first
5. **Get Support**: Share console errors if still stuck

## 📞 Need Help?

If none of these work, share the **exact console error messages** including the emoji prefixes (🔍 🚀 ❌) for specific help!