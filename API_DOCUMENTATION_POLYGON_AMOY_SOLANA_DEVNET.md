# AgentSphere API Documentation: Polygon Amoy & Solana Devnet Integration

**Version**: 2.0  
**Date**: September 17, 2025  
**Target**: AR Viewer Frontend Integration  
**Networks**: 7 Total (5 EVM + Polygon Amoy + Solana Devnet)

---

## 📋 **API Overview**

This document outlines the enhanced AgentSphere backend API endpoints required to support Polygon Amoy and Solana Devnet integration for the AR Viewer frontend.

### **Base URL**

```
Production: https://api.agentsphere.com/v2
Development: http://localhost:3000/v2
```

### **Authentication**

```
Headers:
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
```

---

## 🌐 **Network Support Matrix**

| Network           | Chain ID          | Type    | API Key           | Status     |
| ----------------- | ----------------- | ------- | ----------------- | ---------- |
| Ethereum Sepolia  | 11155111          | EVM     | ethereum-sepolia  | ✅ Active  |
| Arbitrum Sepolia  | 421614            | EVM     | arbitrum-sepolia  | ✅ Active  |
| Base Sepolia      | 84532             | EVM     | base-sepolia      | ✅ Active  |
| OP Sepolia        | 11155420          | EVM     | op-sepolia        | ✅ Active  |
| Avalanche Fuji    | 43113             | EVM     | avalanche-fuji    | ✅ Active  |
| **Polygon Amoy**  | **80002**         | **EVM** | **polygon-amoy**  | **🆕 NEW** |
| **Solana Devnet** | **solana-devnet** | **SVM** | **solana-devnet** | **🆕 NEW** |

---

## 🔗 **Core API Endpoints**

### **1. Agent Data Retrieval**

#### **Get Agent by Network**

```http
GET /v2/agents/{agentId}?network={networkKey}
```

**Parameters:**

- `agentId` (string, required): Agent UUID
- `network` (string, optional): Network key from matrix above

**Example Request:**

```bash
GET /v2/agents/agent-123?network=polygon-amoy
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "agent-123",
    "name": "AI Assistant",
    "description": "Helpful AI agent for customer support",
    "network": {
      "chainId": "80002",
      "chainName": "PolygonAmoy",
      "type": "evm",
      "key": "polygon-amoy"
    },
    "wallet_addresses": {
      "polygon_amoy": "0x742d35cc6ba9b34F8E35c7a84B5D8b1A9a3E8F1B",
      "solana_devnet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
    },
    "interaction_fee": {
      "amount": "4.00",
      "token": "USDC",
      "contract_address": "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"
    },
    "deployment_status": "active",
    "created_at": "2025-09-17T10:00:00Z",
    "updated_at": "2025-09-17T15:30:00Z"
  }
}
```

#### **List Agents by Network**

```http
GET /v2/agents?network={networkKey}&limit={limit}&offset={offset}
```

**Parameters:**

- `network` (string, optional): Network key
- `limit` (number, optional): Max results (default: 20)
- `offset` (number, optional): Pagination offset (default: 0)

**Example Request:**

```bash
GET /v2/agents?network=solana-devnet&limit=10
```

**Response:**

```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": "agent-456",
        "name": "Solana Helper",
        "network": {
          "chainId": "solana-devnet",
          "chainName": "SolanaDevnet",
          "type": "svm"
        },
        "wallet_addresses": {
          "solana_devnet": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
        },
        "interaction_fee": {
          "amount": "2.50",
          "token": "USDC",
          "contract_address": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
        }
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 10,
      "offset": 0,
      "has_more": true
    }
  }
}
```

### **2. Payment Configuration**

#### **Get Payment Config**

```http
GET /v2/agents/{agentId}/payment-config?network={networkKey}
```

**Example Request:**

```bash
GET /v2/agents/agent-123/payment-config?network=polygon-amoy
```

**Response:**

```json
{
  "success": true,
  "data": {
    "agent_id": "agent-123",
    "network": {
      "chainId": "80002",
      "chainName": "PolygonAmoy",
      "type": "evm"
    },
    "payment_methods": {
      "crypto_qr": {
        "enabled": true,
        "supported_tokens": ["USDC"]
      },
      "virtual_card": {
        "enabled": false
      }
    },
    "fee_structure": {
      "interaction_fee": "4.00",
      "token": "USDC",
      "estimated_gas_fee": "0.05",
      "total_cost_estimate": "4.05"
    },
    "wallet_addresses": {
      "polygon_amoy": "0x742d35cc6ba9b34F8E35c7a84B5D8b1A9a3E8F1B"
    },
    "usdc_contract": {
      "address": "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
      "decimals": 6,
      "symbol": "USDC"
    },
    "qr_config": {
      "format": "eip681",
      "example": "ethereum:0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582@80002/transfer?address=0x742d35cc6ba9b34F8E35c7a84B5D8b1A9a3E8F1B&uint256=4000000"
    }
  }
}
```

#### **Solana Payment Config Example**

```bash
GET /v2/agents/agent-456/payment-config?network=solana-devnet
```

**Response:**

```json
{
  "success": true,
  "data": {
    "agent_id": "agent-456",
    "network": {
      "chainId": "solana-devnet",
      "chainName": "SolanaDevnet",
      "type": "svm"
    },
    "payment_methods": {
      "crypto_qr": {
        "enabled": true,
        "supported_tokens": ["USDC"]
      }
    },
    "fee_structure": {
      "interaction_fee": "2.50",
      "token": "USDC",
      "estimated_transaction_fee": "0.01",
      "total_cost_estimate": "2.51"
    },
    "wallet_addresses": {
      "solana_devnet": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
    },
    "usdc_contract": {
      "mint_address": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
      "decimals": 6,
      "symbol": "USDC"
    },
    "qr_config": {
      "format": "solana-pay",
      "example": "solana:4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU?amount=2.50&recipient=9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM&spl-token=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
    }
  }
}
```

### **3. Payment Tracking**

#### **Submit Payment**

```http
POST /v2/payments
```

**Request Body (EVM):**

```json
{
  "agent_id": "agent-123",
  "network": {
    "chainId": "80002",
    "type": "evm"
  },
  "transaction": {
    "hash": "0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
    "from_address": "0x1234567890abcdef1234567890abcdef12345678",
    "to_address": "0x742d35cc6ba9b34F8E35c7a84B5D8b1A9a3E8F1B",
    "amount": "4.00",
    "token": "USDC",
    "token_address": "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    "block_number": 12345678,
    "gas_used": "21000",
    "gas_price": "20000000000"
  },
  "client_info": {
    "ar_viewer_version": "2.1.0",
    "user_agent": "Mozilla/5.0...",
    "timestamp": "2025-09-17T15:30:00Z"
  }
}
```

**Request Body (Solana):**

```json
{
  "agent_id": "agent-456",
  "network": {
    "chainId": "solana-devnet",
    "type": "svm"
  },
  "transaction": {
    "signature": "3K7p8qvKT4Q2Z9X1Y5W3N6M8L4J2H1G5F9E7D3C1B6A9R8T5U2V7W1X4Y8Z2Q3P6M9L2K5J8H1G4F7E3D6C9B2A5R8T1U4V7W0X3Y6Z9Q2P5M8L1K4J7H0G3F6E9D2C5B8A1R4T7U0V3W6X9Y2Z5Q8P1M4L7K0J3H6G9F2E5D8C1B4A7R0T3U6V9W2X5Y8Z1Q4P7M0L3K6J9H2G5F8E1D4C7B0A3R6T9U2V5W8X1Y4Z7Q0P3M6L9K2J5H8G1F4E7D0C3B6A9R2T5U8V1W4X7Y0Z3Q6P9M2L5K8J1H4G7F0E3D6C9B2A5R8T1U4V7W0X3Y6Z9"
  },
  "spl_transfer": {
    "from_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "to_address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    "amount": "2.50",
    "token": "USDC",
    "mint_address": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    "slot": 87654321,
    "fee": "0.000005"
  },
  "client_info": {
    "ar_viewer_version": "2.1.0",
    "user_agent": "Mozilla/5.0...",
    "timestamp": "2025-09-17T15:30:00Z"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "payment_id": "pay_7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
    "status": "received",
    "verification_status": "pending",
    "estimated_confirmation_time": "30 seconds",
    "tracking_url": "https://api.agentsphere.com/v2/payments/pay_7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d"
  }
}
```

#### **Payment Verification**

```http
GET /v2/payments/verify/{transactionId}?network={networkKey}
```

**Parameters:**

- `transactionId`: Transaction hash (EVM) or signature (Solana)
- `network`: Network key

**Example Request (EVM):**

```bash
GET /v2/payments/verify/0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456?network=polygon-amoy
```

**Example Request (Solana):**

```bash
GET /v2/payments/verify/3K7p8qvKT4Q2Z9X1Y5W3N6M8L4J2H1G5F9E7D3C1B6A9R8T5U2V7W1X4Y8Z2Q3P6M9L2K5J8H1G4F7E3D6C9B2A5R8T1U4V7W0X3Y6Z9Q2P5M8L1K4J7H0G3F6E9D2C5B8A1R4T7U0V3W6X9Y2Z5Q8P1M4L7K0J3H6G9F2E5D8C1B4A7R0T3U6V9W2X5Y8Z1Q4P7M0L3K6J9H2G5F8E1D4C7B0A3R6T9U2V5W8X1Y4Z7Q0P3M6L9K2J5H8G1F4E7D0C3B6A9R2T5U8V1W4X7Y0Z3Q6P9M2L5K8J1H4G7F0E3D6C9B2A5R8T1U4V7W0X3Y6Z9?network=solana-devnet
```

**Response:**

```json
{
  "success": true,
  "data": {
    "verified": true,
    "payment_id": "pay_7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
    "agent_id": "agent-123",
    "transaction": {
      "hash": "0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
      "status": "confirmed",
      "confirmations": 15,
      "block_number": 12345678
    },
    "payment_details": {
      "amount": "4.00",
      "token": "USDC",
      "network": "PolygonAmoy",
      "from_address": "0x1234567890abcdef1234567890abcdef12345678",
      "to_address": "0x742d35cc6ba9b34F8E35c7a84B5D8b1A9a3E8F1B"
    },
    "timestamps": {
      "submitted": "2025-09-17T15:30:00Z",
      "confirmed": "2025-09-17T15:30:45Z",
      "verified": "2025-09-17T15:31:00Z"
    }
  }
}
```

### **4. Network Information**

#### **Get Supported Networks**

```http
GET /v2/networks/supported
```

**Response:**

```json
{
  "success": true,
  "data": {
    "networks": [
      {
        "chainId": "80002",
        "chainName": "PolygonAmoy",
        "key": "polygon-amoy",
        "type": "evm",
        "currencySymbol": "MATIC",
        "rpcUrl": "https://rpc-amoy.polygon.technology/",
        "explorerUrl": "https://amoy.polygonscan.com/",
        "usdcSupported": true,
        "usdcContract": "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
        "status": "active"
      },
      {
        "chainId": "solana-devnet",
        "chainName": "SolanaDevnet",
        "key": "solana-devnet",
        "type": "svm",
        "currencySymbol": "SOL",
        "rpcUrl": "https://api.devnet.solana.com",
        "explorerUrl": "https://explorer.solana.com/?cluster=devnet",
        "usdcSupported": true,
        "usdcMint": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
        "status": "active"
      }
    ]
  }
}
```

#### **Get Network Statistics**

```http
GET /v2/networks/{networkKey}/stats
```

**Example Request:**

```bash
GET /v2/networks/polygon-amoy/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "network": "polygon-amoy",
    "status": "healthy",
    "stats": {
      "total_agents": 156,
      "active_agents": 142,
      "total_payments": 2847,
      "total_volume": "11,234.50",
      "avg_payment": "3.95"
    },
    "health": {
      "rpc_status": "online",
      "rpc_latency": "120ms",
      "usdc_contract_status": "verified",
      "last_block": 12345678,
      "block_time": "2.1s"
    },
    "fees": {
      "current_gas_price": "20 gwei",
      "estimated_transfer_cost": "0.05 MATIC",
      "usdc_transfer_cost": "$0.002"
    }
  }
}
```

---

## 🔄 **Cross-Chain Integration (Future Phase 2)**

### **CCIP Lane Information**

```http
GET /v2/networks/{networkKey}/ccip-lanes
```

**Response:**

```json
{
  "success": true,
  "data": {
    "source_network": "polygon-amoy",
    "outbound_lanes": [
      {
        "destination": "ethereum-sepolia",
        "lane_address": "0x719Aef2C63376AdeCD62D2b59D54682aFBde914a",
        "status": "active",
        "estimated_time": "10-15 minutes",
        "fee_range": "$1.50-$3.00"
      },
      {
        "destination": "solana-devnet",
        "lane_address": "0xF4EbCC2c077d3939434C7Ab0572660c5A45e4df5",
        "status": "active",
        "estimated_time": "5-10 minutes",
        "fee_range": "$2.00-$4.00"
      }
    ]
  }
}
```

---

## 🚨 **Error Handling**

### **Standard Error Response**

```json
{
  "success": false,
  "error": {
    "code": "AGENT_NOT_FOUND",
    "message": "Agent with ID 'agent-123' not found on network 'polygon-amoy'",
    "details": {
      "agent_id": "agent-123",
      "network": "polygon-amoy",
      "suggestion": "Check if agent is deployed on the specified network"
    },
    "timestamp": "2025-09-17T15:30:00Z",
    "request_id": "req_7a8b9c0d1e2f3a4b"
  }
}
```

### **Common Error Codes**

| Code                          | Message                     | Description                                        |
| ----------------------------- | --------------------------- | -------------------------------------------------- |
| `AGENT_NOT_FOUND`             | Agent not found             | Agent ID doesn't exist or not on specified network |
| `NETWORK_NOT_SUPPORTED`       | Network not supported       | Invalid network key provided                       |
| `PAYMENT_VERIFICATION_FAILED` | Payment verification failed | Transaction not found or invalid                   |
| `INSUFFICIENT_BALANCE`        | Insufficient balance        | Agent wallet balance too low                       |
| `NETWORK_UNAVAILABLE`         | Network unavailable         | RPC endpoint or network is down                    |
| `INVALID_TRANSACTION`         | Invalid transaction         | Transaction format or data invalid                 |
| `RATE_LIMIT_EXCEEDED`         | Rate limit exceeded         | Too many requests from client                      |

---

## 📊 **Rate Limiting**

### **Limits per API Key**

- **General Endpoints**: 1000 requests/hour
- **Payment Verification**: 5000 requests/hour
- **Network Statistics**: 100 requests/hour

### **Headers**

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1694950800
```

---

## 🔐 **Security & Compliance**

### **API Key Management**

- Production keys: Restricted to whitelisted domains
- Development keys: Localhost + staging environments only
- Rotation: Every 90 days

### **Data Privacy**

- PII encryption at rest and in transit
- Transaction data retention: 2 years
- User consent required for analytics

### **Webhook Security**

- HMAC signature verification
- TLS 1.3 required
- IP whitelisting available

---

## 🧪 **Testing & Development**

### **Test Agent IDs**

```
Polygon Amoy Test Agent: agent-test-polygon-001
Solana Devnet Test Agent: agent-test-solana-001
```

### **Test Transaction IDs**

```
Polygon Amoy: 0xtest1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
Solana Devnet: test3K7p8qvKT4Q2Z9X1Y5W3N6M8L4J2H1G5F9E7D3C1B6A9R8T5U2V7W1X4Y8Z2Q3P6M9L2K5J8H1G4F7E3D6C9B2A5R8T1U4V7W0X3Y6Z9Q2P5M8L1K4J7H0G3F6E9D2C5B8A1R4T7U0V3W6X9Y2Z5Q8P1M4L7K0J3H6G9F2E5D8C1B4A7R0T3U6V9W2X5Y8Z1Q4P7M0L3K6J9H2G5F8E1D4C7B0A3R6T9U2V5W8X1Y4Z7Q0P3M6L9K2J5H8G1F4E7D0C3B6A9R2T5U8V1W4X7Y0Z3Q6P9M2L5K8J1H4G7F0E3D6C9B2A5R8T1U4V7W0X3Y6Z9
```

### **Postman Collection**

```
Download: https://api.agentsphere.com/v2/docs/postman-collection.json
```

---

## 📋 **Migration Guide**

### **From API v1 to v2**

#### **Breaking Changes:**

1. **Network Parameter**: Now required for multi-chain support
2. **Wallet Addresses**: Returns object with multiple network addresses
3. **Payment Format**: Different structure for EVM vs Solana

#### **Migration Steps:**

1. Update base URL from `/v1` to `/v2`
2. Add `network` parameter to agent queries
3. Update payment submission format based on network type
4. Handle both EVM and Solana transaction formats

#### **Backward Compatibility:**

- v1 endpoints deprecated but functional until Q1 2026
- Automatic migration to default network (Ethereum Sepolia) for v1 calls

---

## 📞 **Support & Resources**

### **Developer Resources**

- **API Documentation**: https://docs.agentsphere.com/api/v2
- **SDK Downloads**: https://github.com/agentsphere/sdks
- **Code Examples**: https://github.com/agentsphere/examples

### **Support Channels**

- **Discord**: https://discord.gg/agentsphere-dev
- **Email**: api-support@agentsphere.com
- **Status Page**: https://status.agentsphere.com

---

**Document Version**: 2.0.0  
**Last Updated**: September 17, 2025  
**Next Review**: October 1, 2025
