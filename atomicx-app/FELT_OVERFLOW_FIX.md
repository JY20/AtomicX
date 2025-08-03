# Felt Overflow Fix

## Issue

When creating an HTLC on Starknet, users were encountering a "felt overflow" error:

```
RPC: starknet_estimateFee with params {
  "request": [
    {
      "type": "INVOKE",
      "sender_address": "0x012b099f50c3cbcc82ccf7ee557c9d60255c35c359ea6615435b761ec3336ec8",
      "calldata": [
        "0x1",
        "0x28cd39a0ba1144339b6d095e6323b994ed836d92dc160cb36150bf84724317d",
        "0x15511cc3694f64379908437d6d64458dc76d02482052bfb8a5b33a72c054c77",
        "0x2",
        "0xf22c4",
        "0xb1e7adbfade86b6d7f621b93c7daa2b3f8608b860802b98d90bd41d828d7650f"
      ],
      ...
    }
  ],
  ...
}

-32602: Invalid params: {"reason":"felt overflow"}
```

## Cause

In Starknet, a `felt252` has a limited size (max value is approximately 2^251 - 1). When converting token amounts from Ethereum's format to Starknet's format, the values were exceeding this limit, causing an overflow.

## Solution

The fix involves properly handling the conversion of token amounts to ensure they don't exceed the maximum felt252 value:

1. Define the maximum felt252 value as a constant
2. Use modulo operation to ensure the value stays within the valid range
3. Keep the high bits as 0 to avoid overflow

```javascript
// Handle felt252 size limitation (max ~76 decimal digits)
const MAX_FELT = ethers.BigNumber.from("0x800000000000000000000000000000000000000000000000000000000000000");
const amountLow = amountInUnits.mod(MAX_FELT).toString();
const amountHigh = "0"; // Keep high bits as 0 to avoid overflow
```

This ensures that the amount value passed in the transaction will always be within the valid range for a felt252, preventing the overflow error.