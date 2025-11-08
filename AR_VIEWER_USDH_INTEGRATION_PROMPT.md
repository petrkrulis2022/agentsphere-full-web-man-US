# AR Viewer Integration Prompt: USDh and Custom Stablecoins Support

## Objective

Update the AR Viewer application to support USDh and 6 additional custom ERC-20 stablecoins for payments on Hedera Testnet and other supported EVM testnets.

---

## Background

The main AgentSphere application has been updated to remove native HBAR token support and now exclusively uses ERC-20 stablecoins for payments. We need to update the AR Viewer to match this implementation.

**Key Changes:**

- ❌ Removed: HBAR (native token)
- ✅ Added: USDh (deployed on Hedera Testnet)
- ✅ Added: 6 additional custom stablecoins (placeholders ready)

---

## Custom Stablecoins to Integrate

### 1. **USDh** ✅ (DEPLOYED - Priority 1)

- **Token Name:** USDh
- **Contract Address (Hedera Testnet):** `0x00000000000000000000000000000000006e24c7`
- **Decimals:** 6
- **Status:** DEPLOYED AND ACTIVE
- **Networks:** Hedera Testnet (296), will expand to all testnets

### 2. **USDΔ** (USD Delta) - Placeholder

- **Token Name:** USDΔ
- **Contract Address:** `0x0000000000000000000000000000000000000000` (TODO: Update when deployed)
- **Decimals:** 6
- **Status:** NOT YET DEPLOYED
- **Networks:** All supported testnets (Hedera, Ethereum Sepolia, Arbitrum, Base, OP, Avalanche, Polygon Amoy)

### 3. **USDaix** - Placeholder

- **Token Name:** USDaix
- **Contract Address:** `0x0000000000000000000000000000000000000000` (TODO: Update when deployed)
- **Decimals:** 6
- **Status:** NOT YET DEPLOYED
- **Networks:** All supported testnets

### 4. **USDΔ+** (USD Delta Plus) - Placeholder

- **Token Name:** USDΔ+
- **Contract Address:** `0x0000000000000000000000000000000000000000` (TODO: Update when deployed)
- **Decimals:** 6
- **Status:** NOT YET DEPLOYED
- **Networks:** All supported testnets

### 5. **USDaix+** (USDaix Plus) - Placeholder

- **Token Name:** USDaix+
- **Contract Address:** `0x0000000000000000000000000000000000000000` (TODO: Update when deployed)
- **Decimals:** 6
- **Status:** NOT YET DEPLOYED
- **Networks:** All supported testnets

### 6. **USDar** - Placeholder

- **Token Name:** USDar
- **Contract Address:** `0x0000000000000000000000000000000000000000` (TODO: Update when deployed)
- **Decimals:** 6
- **Status:** NOT YET DEPLOYED
- **Networks:** All supported testnets

### 7. **USDair** - Placeholder

- **Token Name:** USDair
- **Contract Address:** `0x0000000000000000000000000000000000000000` (TODO: Update when deployed)
- **Decimals:** 6
- **Status:** NOT YET DEPLOYED
- **Networks:** All supported testnets

---

## Required Changes in AR Viewer

### 1. **Remove HBAR Native Token Support**

**Files to Update:**

- Payment processing logic
- Token configuration
- Balance display
- Transaction handling

**Remove:**

```typescript
// Old HBAR logic
if (token === "HBAR") {
  // Native transfer logic
}
```

**Replace with ERC-20 only logic for all tokens**

---

### 2. **Add USDh Stablecoin Configuration**

#### Network Configuration for Hedera Testnet

```typescript
const HEDERA_TESTNET_CONFIG = {
  chainId: 296,
  name: "Hedera Testnet",
  rpcUrl: "https://testnet.hashio.io/api",
  explorerUrl: "https://hashscan.io/testnet",
  nativeCurrency: {
    name: "HBAR",
    symbol: "HBAR",
    decimals: 18,
  },
  // Custom Stablecoins
  stablecoins: {
    USDh: {
      address: "0x00000000000000000000000000000000006e24c7",
      decimals: 6,
      symbol: "USDh",
      name: "USDh Stablecoin",
    },
    USDΔ: {
      address: "0x0000000000000000000000000000000000000000", // TODO: Update
      decimals: 6,
      symbol: "USDΔ",
      name: "USD Delta",
    },
    USDaix: {
      address: "0x0000000000000000000000000000000000000000", // TODO: Update
      decimals: 6,
      symbol: "USDaix",
      name: "USDaix",
    },
    "USDΔ+": {
      address: "0x0000000000000000000000000000000000000000", // TODO: Update
      decimals: 6,
      symbol: "USDΔ+",
      name: "USD Delta Plus",
    },
    "USDaix+": {
      address: "0x0000000000000000000000000000000000000000", // TODO: Update
      decimals: 6,
      symbol: "USDaix+",
      name: "USDaix Plus",
    },
    USDar: {
      address: "0x0000000000000000000000000000000000000000", // TODO: Update
      decimals: 6,
      symbol: "USDar",
      name: "USDar",
    },
    USDair: {
      address: "0x0000000000000000000000000000000000000000", // TODO: Update
      decimals: 6,
      symbol: "USDair",
      name: "USDair",
    },
  },
};
```

---

### 3. **Update Payment Processing for ERC-20 Tokens**

#### ERC-20 Transfer Function

```typescript
/**
 * Transfer ERC-20 tokens (USDh, USDΔ, USDaix, etc.)
 * @param tokenAddress - Contract address of the ERC-20 token
 * @param recipientAddress - Address receiving the payment
 * @param amount - Amount in token units (with decimals)
 * @param decimals - Token decimals (default 6 for all custom stablecoins)
 */
async function transferERC20Token(
  tokenAddress: string,
  recipientAddress: string,
  amount: number,
  decimals: number = 6
) {
  // Convert amount to smallest unit (e.g., 10 USDh = 10000000 with 6 decimals)
  const amountInWei = ethers.utils.parseUnits(amount.toString(), decimals);

  // ERC-20 transfer function ABI
  const erc20Abi = [
    "function transfer(address to, uint256 amount) public returns (bool)",
  ];

  // Connect to contract
  const contract = new ethers.Contract(tokenAddress, erc20Abi, signer);

  // Execute transfer
  const tx = await contract.transfer(recipientAddress, amountInWei);

  // Wait for confirmation
  const receipt = await tx.wait();

  return receipt;
}
```

---

### 4. **Update Payment Verification**

#### Verify USDh and Custom Stablecoin Payments

```typescript
/**
 * Verify ERC-20 token payment
 * @param tokenSymbol - Symbol of the token (e.g., "USDh", "USDΔ", etc.)
 * @param agentId - ID of the agent being paid
 * @param expectedAmount - Expected payment amount
 */
async function verifyERC20Payment(
  tokenSymbol: string,
  agentId: string,
  expectedAmount: number
) {
  // Get token configuration
  const tokenConfig = HEDERA_TESTNET_CONFIG.stablecoins[tokenSymbol];

  if (!tokenConfig) {
    throw new Error(`Unsupported token: ${tokenSymbol}`);
  }

  // Get agent's payment address from database
  const agent = await getAgentById(agentId);

  // Check transaction on blockchain
  const erc20Abi = [
    "function balanceOf(address account) view returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
  ];

  const contract = new ethers.Contract(tokenConfig.address, erc20Abi, provider);

  // Listen for Transfer events to agent's address
  const filter = contract.filters.Transfer(null, agent.walletAddress);
  const events = await contract.queryFilter(filter);

  // Verify amount matches
  const lastEvent = events[events.length - 1];
  const receivedAmount = ethers.utils.formatUnits(
    lastEvent.args.value,
    tokenConfig.decimals
  );

  return parseFloat(receivedAmount) >= expectedAmount;
}
```

---

### 5. **Update QR Code Generation**

#### Generate Payment QR Code for Custom Stablecoins

```typescript
/**
 * Generate QR code for ERC-20 token payment
 * @param tokenSymbol - Symbol (e.g., "USDh", "USDΔ", "USDaix")
 * @param recipientAddress - Address to receive payment
 * @param amount - Amount to pay
 * @param agentId - Agent ID for reference
 */
function generateERC20PaymentQR(
  tokenSymbol: string,
  recipientAddress: string,
  amount: number,
  agentId: string
) {
  // Get token configuration
  const network = getCurrentNetwork(); // Hedera Testnet or other
  const tokenConfig = network.stablecoins[tokenSymbol];

  if (!tokenConfig) {
    throw new Error(`Token ${tokenSymbol} not configured for ${network.name}`);
  }

  // Create payment data
  const paymentData = {
    type: "ERC20_PAYMENT",
    network: network.name,
    chainId: network.chainId,
    token: {
      symbol: tokenSymbol,
      address: tokenConfig.address,
      decimals: tokenConfig.decimals,
    },
    recipient: recipientAddress,
    amount: amount,
    agentId: agentId,
    timestamp: Date.now(),
  };

  // Generate QR code
  const qrData = JSON.stringify(paymentData);
  return QRCode.toDataURL(qrData);
}
```

---

### 6. **Update Balance Display**

#### Show USDh and Custom Stablecoin Balances

```typescript
/**
 * Get all custom stablecoin balances for a wallet
 * @param walletAddress - User's wallet address
 * @param chainId - Network chain ID
 */
async function getCustomStablecoinBalances(
  walletAddress: string,
  chainId: number
) {
  const network = getNetworkConfig(chainId);
  const balances: Record<string, number> = {};

  // ERC-20 balanceOf ABI
  const erc20Abi = [
    "function balanceOf(address account) view returns (uint256)",
  ];

  // Fetch balance for each custom stablecoin
  for (const [symbol, config] of Object.entries(network.stablecoins)) {
    try {
      // Skip if placeholder address
      if (config.address === "0x0000000000000000000000000000000000000000") {
        balances[symbol] = 0;
        continue;
      }

      const contract = new ethers.Contract(config.address, erc20Abi, provider);

      const balance = await contract.balanceOf(walletAddress);
      balances[symbol] = parseFloat(
        ethers.utils.formatUnits(balance, config.decimals)
      );
    } catch (error) {
      console.error(`Error fetching ${symbol} balance:`, error);
      balances[symbol] = 0;
    }
  }

  return balances;
}

// Example usage
const balances = await getCustomStablecoinBalances(userAddress, 296);
console.log("USDh Balance:", balances.USDh);
console.log("USDΔ Balance:", balances.USDΔ);
console.log("USDaix Balance:", balances.USDaix);
// etc.
```

---

### 7. **Update Agent Card Display**

#### Show Payment Token Information

```typescript
interface AgentPaymentInfo {
  agentId: string;
  paymentToken: string; // "USDh", "USDΔ", "USDaix", etc.
  interactionFee: number; // Amount in token units
  walletAddress: string;
  network: string;
  chainId: number;
}

function displayAgentPayment(agent: AgentPaymentInfo) {
  return `
    <div class="agent-payment-info">
      <h3>Payment Information</h3>
      <p>Token: ${agent.paymentToken}</p>
      <p>Fee: ${agent.interactionFee} ${agent.paymentToken}</p>
      <p>Network: ${agent.network}</p>
      <button onclick="payAgent('${agent.agentId}')">
        Pay ${agent.interactionFee} ${agent.paymentToken}
      </button>
    </div>
  `;
}
```

---

### 8. **Database Schema Updates**

#### Store Custom Stablecoin Information

Update the `deployed_objects` table (or equivalent) to include:

```sql
ALTER TABLE deployed_objects
  ADD COLUMN payment_token VARCHAR(20) DEFAULT 'USDh',
  ADD COLUMN token_contract_address VARCHAR(42),
  ADD COLUMN token_decimals INTEGER DEFAULT 6;

-- Update existing records to USDh if on Hedera Testnet
UPDATE deployed_objects
SET payment_token = 'USDh',
    token_contract_address = '0x00000000000000000000000000000000006e24c7',
    token_decimals = 6
WHERE network = 'Hedera Testnet' AND payment_token = 'HBAR';
```

---

### 9. **Error Handling**

#### Handle Placeholder Addresses

```typescript
function validateTokenAddress(tokenSymbol: string, chainId: number) {
  const network = getNetworkConfig(chainId);
  const token = network.stablecoins[tokenSymbol];

  if (!token) {
    throw new Error(`Token ${tokenSymbol} not supported on chain ${chainId}`);
  }

  // Check for placeholder address
  if (token.address === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      `${tokenSymbol} is not yet deployed on ${network.name}. ` +
        `Please select a different payment token.`
    );
  }

  return token;
}
```

---

### 10. **Migration Strategy**

#### Handle Existing HBAR Agents

```typescript
/**
 * Migrate existing HBAR agents to USDh
 */
async function migrateHBARToUSDh() {
  // Find all agents using HBAR on Hedera Testnet
  const hbarAgents = await database.query(`
    SELECT * FROM deployed_objects 
    WHERE payment_token = 'HBAR' 
    AND network = 'Hedera Testnet'
  `);

  for (const agent of hbarAgents) {
    // Convert fee from HBAR to USDh (1 HBAR -> 10 USDh)
    const newFee =
      agent.interaction_fee === 1 ? 10 : agent.interaction_fee * 10;

    // Update agent
    await database.query(
      `
      UPDATE deployed_objects
      SET payment_token = 'USDh',
          token_contract_address = '0x00000000000000000000000000000000006e24c7',
          token_decimals = 6,
          interaction_fee = ?
      WHERE id = ?
    `,
      [newFee, agent.id]
    );

    console.log(`Migrated agent ${agent.id} from HBAR to USDh`);
  }
}
```

---

## Testing Checklist

### Phase 1: USDh Integration (Priority)

- [ ] Verify USDh contract address: `0x00000000000000000000000000000000006e24c7`
- [ ] Test USDh balance display in AR Viewer
- [ ] Test USDh payment transaction flow
- [ ] Test QR code generation for USDh payments
- [ ] Test payment verification for USDh
- [ ] Test agent card displays USDh fee correctly
- [ ] Verify HBAR logic is completely removed
- [ ] Test on Hedera Testnet (Chain ID 296)

### Phase 2: Additional Stablecoins (When Deployed)

- [ ] Add contract addresses for USDΔ, USDaix, USDΔ+, USDaix+, USDar, USDair
- [ ] Test each token on Hedera Testnet
- [ ] Test each token on other testnets (Ethereum, Arbitrum, etc.)
- [ ] Verify balance display for all tokens
- [ ] Test payment flow for each token
- [ ] Test QR code generation for each token

### Phase 3: Cross-Network Testing

- [ ] Test Ethereum Sepolia (Chain ID 11155111)
- [ ] Test Arbitrum Sepolia (Chain ID 421614)
- [ ] Test Base Sepolia (Chain ID 84532)
- [ ] Test OP Sepolia (Chain ID 11155420)
- [ ] Test Avalanche Fuji (Chain ID 43113)
- [ ] Test Polygon Amoy (Chain ID 80002)

---

## Important Notes

1. **USDh is LIVE:** Contract `0x00000000000000000000000000000000006e24c7` is deployed and active on Hedera Testnet
2. **Other 6 tokens are PLACEHOLDERS:** They will fail if used until contracts are deployed
3. **6 Decimals:** All custom stablecoins use 6 decimals (like USDC), not 18
4. **ERC-20 Only:** No native tokens (HBAR, ETH, MATIC, etc.) - only ERC-20 stablecoins
5. **Same Address Across Chains:** When deploying to other testnets, use the SAME contract addresses
6. **Database Migration:** Existing HBAR agents should be migrated to USDh

---

## Expected Behavior After Integration

### When User Views Agent on Hedera Testnet:

1. ✅ Agent card shows: "Pay 10 USDh" (not "Pay 1 HBAR")
2. ✅ QR code encodes: USDh payment data with contract address
3. ✅ Wallet shows: USDh balance (e.g., "250.5000 USDh")
4. ✅ Payment button triggers: ERC-20 transfer function
5. ✅ Transaction uses: Standard ERC-20 `transfer()` method
6. ✅ Verification checks: ERC-20 Transfer event to agent's wallet

### When User Selects Different Token:

- User can choose: USDh, USDΔ, USDaix, USDΔ+, USDaix+, USDar, or USDair
- System validates: Token is deployed on current network
- If placeholder (0x000...000): Show error message "Token not yet deployed"
- If valid: Process payment using that token's contract address

---

## Reference Links

- **Hedera Testnet RPC:** https://testnet.hashio.io/api
- **Hedera Explorer:** https://hashscan.io/testnet
- **USDh Contract:** https://hashscan.io/testnet/token/0x00000000000000000000000000000000006e24c7
- **Main App Repository:** agentsphere-full-web-man-US
- **Branch:** revolut-pay-sim-solana-hedera

---

## Summary

**Remove:** Native HBAR token support  
**Add:** USDh ERC-20 stablecoin (deployed at `0x00000000000000000000000000000000006e24c7`)  
**Prepare:** Infrastructure for 6 additional custom stablecoins  
**Standardize:** All payments use ERC-20 transfer flow  
**Decimals:** All custom stablecoins use 6 decimals  
**Networks:** Support across Hedera, Ethereum, Arbitrum, Base, OP, Avalanche, Polygon testnets

This integration will make AR Viewer payments consistent with the main AgentSphere application and provide a scalable foundation for additional stablecoins! 🚀
