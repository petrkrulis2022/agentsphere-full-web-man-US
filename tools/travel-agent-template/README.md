# Travel Agent Template with x402 MCP Integration

A Travel Agent implementation using:

- **A2A Protocol** for agent-to-agent communication
- **x402 Micropayments** for accessing Flightradar24 MCP server
- **Hedera HTS** for USDH stablecoin transfers
- **Thirdweb Nexus** for MCP server discovery

## Architecture

```
User → Travel Agent → Flightradar24 MCP (via x402)
                   ↓
              Bus/Train/Hotel Agents (via A2A)
```

## Payment Flows

1. **User → Travel Agent**: Standard HTS transfer (USDH)
2. **Travel Agent → Flightradar24**: x402 micropayment ($0.00022 per query)
3. **Travel Agent ↔ Other Agents**: Standard HTS transfer (A2A)

## Setup

### 1. Install Dependencies

```bash
cd tools/travel-agent-template
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

**Required Configuration:**

- `AGENT_ACCOUNT_ID`: Your Travel Agent Hedera account (e.g., `0.0.7145010`)
- `AGENT_PRIVATE_KEY`: Private key for the account
- `USDH_TOKEN_ID`: USDH token ID (default: `0.0.7218375`)
- `MCP_FLIGHTRADAR_ENABLED`: Set to `true` to enable Flightradar24 integration

### 3. Fund Agent Account

The agent needs USDH tokens to pay for MCP queries:

```javascript
// Minimum balance calculation:
// 100 queries * 0.00022 USDH = 0.022 USDH
// Recommended: 10-100 USDH for testing
```

Transfer USDH to your agent account via AgentSphere or direct HTS transfer.

### 4. Run Agent

```bash
npm start
```

Agent will start on `http://localhost:4001`

## Testing

### Test x402 Payment Flow

```bash
curl -X POST http://localhost:4001/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "messageId": "test-001",
      "role": "user",
      "parts": [{"kind": "text", "text": "Find flights from BUD to BCN on 2025-01-15"}],
      "kind": "message"
    }
  }'
```

Expected flow:

1. Agent receives message
2. Parses flight query (BUD → BCN)
3. Calls Flightradar24 MCP endpoint
4. Receives 402 Payment Required
5. Pays 0.00022 USDH via Hedera HTS
6. Retries request with payment proof
7. Receives flight data
8. Returns formatted response to user

### Check Agent Balance

```bash
curl http://localhost:4001/health
```

Response:

```json
{
  "status": "healthy",
  "agent": "Travel Agent",
  "version": "2.0.0",
  "mcp_enabled": true,
  "account_id": "0.0.7145010"
}
```

## File Structure

```
travel-agent-template/
├── services/
│   ├── x402Service.js       # HTTP 402 payment handling
│   └── mcpService.js         # Flightradar24 API wrapper
├── index.js                  # Main agent server
├── package.json              # Dependencies
├── .env.example              # Environment template
└── README.md                 # This file
```

## x402 Payment Service

**Location:** `services/x402Service.js`

**Features:**

- Parse L402 invoice from 402 responses
- Execute Hedera HTS transfers
- Retry logic with payment proof
- Balance checking

**Usage:**

```javascript
import X402PaymentService from './services/x402Service.js';

const paymentService = new X402PaymentService({
  accountId: '0.0.7145010',
  privateKey: 'YOUR_PRIVATE_KEY',
  usdhTokenId: '0.0.7218375',
  network: 'testnet'
});

const response = await paymentService.makeX402Request(
  'https://nexus.thirdweb.com/routes/dck8b9de',
  { method: 'POST' },
  { method: 'queryFlights', params: {...} }
);
```

## MCP Service (Flightradar24)

**Location:** `services/mcpService.js`

**Features:**

- Flight query with automatic x402 payment
- Query result caching (5-minute TTL)
- Balance management
- Error handling and retries

**Usage:**

```javascript
import FlightradarMcpService from "./services/mcpService.js";

const mcpService = new FlightradarMcpService({
  accountId: "0.0.7145010",
  privateKey: "YOUR_PRIVATE_KEY",
  mcpEndpoint: "https://nexus.thirdweb.com/routes/dck8b9de",
});

// Query flights
const flights = await mcpService.queryFlights({
  origin: "BUD",
  destination: "BCN",
  date: "2025-01-15",
  maxResults: 5,
});

// Check balance
const balance = await mcpService.getBalance();
console.log(`Queries available: ${balance.queries_available}`);
```

## Deployment to AgentSphere

After local testing, deploy via AgentSphere dashboard:

1. Navigate to **Agent Deployment**
2. Select **Travel Agent** type
3. Set deployment fee: `100 USDH` (testing) or `625 USDH` (production)
4. ✅ **Enable Flightradar24 MCP** (new checkbox)
5. Deploy

AgentSphere will:

- Create Hedera account
- Transfer initial USDH balance
- Deploy agent with MCP configuration
- Mint AID NFT
- Register in A2A network

## Cost Analysis

### Per-Query Costs

- **Flightradar24 MCP**: $0.00022 (0.00022 USDH)
- **Hedera Transaction Fee**: ~$0.0001 (0.001 HBAR)
- **Total per query**: ~$0.00032

### Operating Costs (100 queries/day)

- **Monthly MCP costs**: $0.66 (0.66 USDH)
- **Monthly transaction fees**: ~$0.30 (30 HBAR)
- **Recommended balance**: 10-50 USDH

## Troubleshooting

### Error: "Insufficient USDH balance"

**Solution:** Transfer more USDH to agent account

```bash
# Check current balance
curl http://localhost:4001/health

# Transfer via AgentSphere or HTS
```

### Error: "402 response missing WWW-Authenticate header"

**Solution:** MCP server may be down or endpoint incorrect

- Verify endpoint: `https://nexus.thirdweb.com/routes/dck8b9de`
- Check Thirdweb Nexus status

### Error: "Payment execution failed"

**Solution:** Check Hedera network status and account permissions

- Ensure agent account is associated with USDH token
- Verify private key has signing permissions

## Next Steps

1. **Local Testing**: Test all x402 flows with sample queries
2. **Integration Testing**: Test A2A coordination with Bus/Train/Hotel agents
3. **AgentSphere Deployment**: Deploy Travel Agent 2 (testing) with MCP enabled
4. **Production Deployment**: Deploy Travel Agent 3 with higher deployment fee
5. **AR Viewer Integration**: Connect AR UI to display flight options

## Resources

- [A2A Protocol Documentation](../tutorial-a2a-x402-trustless-agent/)
- [x402 Hedera Implementation](../x402-hedera/)
- [Thirdweb Nexus](https://thirdweb.com/nexus)
- [Hedera SDK Documentation](https://docs.hedera.com/hedera/sdks-and-apis/sdks)
