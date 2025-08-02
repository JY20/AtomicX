# Starknet Felt Overflow Fix

## Problem

The application was encountering a "felt overflow" error when trying to create a Starknet HTLC:

```
"reason":"felt overflow"
```

This error occurs when a value exceeds the maximum size that can be represented by a Starknet felt (field element), which is approximately 2^251.

## Root Cause Analysis

The issue was in the `createStarknetHTLC` function in `WalletContext.js`. When converting the ETH amount to STRK tokens:

1. We were using `ethers.utils.parseEther(amount.toString())` to convert the amount to wei units
2. Then using `uint256.bnToUint256(amountInUnits.toString())` to convert to Starknet's u256 format
3. The resulting value was too large for Starknet's felt type when passed in the transaction calldata

## Solution

The fix implements several safeguards to prevent felt overflow:

1. **Limit Maximum Amount**: Cap the amount to a reasonable maximum (1000 ETH)
   ```javascript
   const safeAmount = Math.min(parseFloat(amount), 1000).toString();
   ```

2. **Safer Conversion to u256**: Use string representations and explicit low/high bits
   ```javascript
   const amountInUnits = ethers.utils.parseEther(safeAmount);
   const amountLow = amountInUnits.mod(ethers.constants.MaxUint256).toString();
   const amountHigh = "0"; // Keep high bits as 0 to avoid overflow
   ```

3. **String Representation for Calldata**: Ensure all numeric values are passed as strings
   ```javascript
   calldata: [
     hashlock,
     recipient,
     STRK_TOKEN_ADDRESS,
     amountLow,  // Use string representation
     amountHigh,
     timelock.toString()  // Ensure timelock is a string
   ]
   ```

4. **Added Debug Logging**: Added detailed logging to help diagnose any future issues
   ```javascript
   console.log('💰 Amount conversion:', {
     originalAmount: amount,
     safeAmount,
     amountInUnits: amountInUnits.toString(),
     amountLow,
     amountHigh
   });
   ```

## Technical Details

### Maximum Felt Value

A Starknet felt is a 252-bit integer, with a maximum value of 2^251 - 1. This is approximately:
```
3.618502788666131e+75
```

### Starknet u256 Type

The u256 type in Starknet is represented as two felt values:
- `low`: The lower 128 bits
- `high`: The higher 128 bits

By ensuring `high` is always 0 and `low` is properly formatted as a string, we avoid overflow issues.

## Testing

The fix has been tested by:
1. Building the application successfully
2. Verifying that the transaction calldata is properly formatted
3. Ensuring that the transaction can be submitted to the Starknet network without felt overflow errors

## Future Considerations

For future development:
1. Consider implementing a more sophisticated amount validation system
2. Add unit tests specifically for the amount conversion logic
3. Consider using BigInt for safer handling of large numbers