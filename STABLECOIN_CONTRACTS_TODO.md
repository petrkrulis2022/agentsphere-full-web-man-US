# Stablecoin Contract Addresses - TODO

This document lists all the custom ERC-20 stablecoins that need contract addresses to be added.

## Custom Stablecoins

All stablecoins use **6 decimals** (like USDC) and are ERC-20 tokens deployed across all supported testnets.

### 1. **USDh** ✅ (COMPLETED)

- **Hedera Testnet**: `0x00000000000000000000000000000000006e24c7`
- Other Networks: TODO

### 2. **USDΔ** (USD Delta)

- **All Networks**: TODO - Add contract address

### 3. **USDaix**

- **All Networks**: TODO - Add contract address

### 4. **USDΔ+** (USD Delta Plus)

- **All Networks**: TODO - Add contract address

### 5. **USDaix+** (USDaix Plus)

- **All Networks**: TODO - Add contract address

### 6. **USDar**

- **All Networks**: TODO - Add contract address

### 7. **USDair**

- **All Networks**: TODO - Add contract address

---

## Where to Update Contract Addresses

### 1. **DeployObject.tsx** (Line ~220)

Update the `getTokenAddresses()` function for each network:

```typescript
case 296: // Hedera Testnet
  return {
    USDh: "0x00000000000000000000000000000000006e24c7",
    USDΔ: "0x0000000000000000000000000000000000000000", // ← UPDATE HERE
    USDaix: "0x0000000000000000000000000000000000000000", // ← UPDATE HERE
    "USDΔ+": "0x0000000000000000000000000000000000000000", // ← UPDATE HERE
    "USDaix+": "0x0000000000000000000000000000000000000000", // ← UPDATE HERE
    USDar: "0x0000000000000000000000000000000000000000", // ← UPDATE HERE
    USDair: "0x0000000000000000000000000000000000000000", // ← UPDATE HERE
  };
```

Repeat for all other networks (Ethereum Sepolia, Arbitrum, Base, OP, Avalanche, Polygon Amoy).

### 2. **hederaWalletService.ts** (Line ~156+)

Update the contract addresses in the balance fetching methods:

```typescript
public async getUSDDeltaBalance(walletAddress: string): Promise<number> {
  const USDDELTA_CONTRACT = "0x0000000000000000000000000000000000000000"; // ← UPDATE HERE
  return this.getERC20Balance(walletAddress, USDDELTA_CONTRACT, 6);
}
```

Do the same for:

- `getUSDaixBalance()`
- `getUSDDeltaPlusBalance()`
- `getUSDaixPlusBalance()`
- `getUSdarBalance()`
- `getUSDairBalance()`

---

## Testing Checklist

Once contract addresses are added:

- [ ] Test USDh balance display on Hedera Testnet
- [ ] Test USDΔ balance display
- [ ] Test USDaix balance display
- [ ] Test USDΔ+ balance display
- [ ] Test USDaix+ balance display
- [ ] Test USDar balance display
- [ ] Test USDair balance display
- [ ] Test agent deployment with each stablecoin
- [ ] Test QR code generation with each stablecoin
- [ ] Test payments with each stablecoin
- [ ] Verify balances update correctly after transactions

---

## Implementation Status

| Stablecoin | Hedera Testnet | Eth Sepolia | Arbitrum | Base | OP  | Avalanche | Polygon Amoy |
| ---------- | -------------- | ----------- | -------- | ---- | --- | --------- | ------------ |
| USDh       | ✅             | ⏳          | ⏳       | ⏳   | ⏳  | ⏳        | ⏳           |
| USDΔ       | ⏳             | ⏳          | ⏳       | ⏳   | ⏳  | ⏳        | ⏳           |
| USDaix     | ⏳             | ⏳          | ⏳       | ⏳   | ⏳  | ⏳        | ⏳           |
| USDΔ+      | ⏳             | ⏳          | ⏳       | ⏳   | ⏳  | ⏳        | ⏳           |
| USDaix+    | ⏳             | ⏳          | ⏳       | ⏳   | ⏳  | ⏳        | ⏳           |
| USDar      | ⏳             | ⏳          | ⏳       | ⏳   | ⏳  | ⏳        | ⏳           |
| USDair     | ⏳             | ⏳          | ⏳       | ⏳   | ⏳  | ⏳        | ⏳           |

Legend:

- ✅ = Contract deployed and configured
- ⏳ = Placeholder added, awaiting contract address
- ❌ = Not configured
