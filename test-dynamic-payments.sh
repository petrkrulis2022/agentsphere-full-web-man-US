#!/bin/bash

# Test script for Dynamic Payment System
# Tests agent deployment and payment sessions

echo "🧪 Dynamic Payment System - Test Suite"
echo "========================================"
echo ""

BASE_URL="http://localhost:3001"

# Test 1: Deploy Payment Terminal Agent
echo "Test 1: Deploy Payment Terminal Agent"
echo "--------------------------------------"
TERMINAL_RESPONSE=$(curl -s -X POST $BASE_URL/api/agents/deploy \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "payment_terminal",
    "name": "My Virtual Terminal",
    "description": "Payment terminal for e-shop",
    "paymentToken": "USDC",
    "paymentMethods": {
      "crypto": {
        "enabled": true,
        "tokens": ["USDC", "USDT", "DAI"]
      },
      "revolut": {
        "qr": true,
        "virtualCard": true
      }
    }
  }')

echo "Response:"
echo "$TERMINAL_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$TERMINAL_RESPONSE"
echo ""

# Extract terminal agent ID
TERMINAL_ID=$(echo "$TERMINAL_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ Terminal Agent ID: $TERMINAL_ID"
echo ""

# Test 2: Deploy Regular Agent (for comparison)
echo "Test 2: Deploy Regular Agent (Text Chat)"
echo "----------------------------------------"
REGULAR_RESPONSE=$(curl -s -X POST $BASE_URL/api/agents/deploy \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "text_chat",
    "name": "My Text Chat Agent",
    "description": "Regular text chat agent",
    "paymentToken": "USDC",
    "interactionFee": 10
  }')

echo "Response:"
echo "$REGULAR_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$REGULAR_RESPONSE"
echo ""

# Test 3: Get Terminal Agent Details
echo "Test 3: Get Terminal Agent Details"
echo "-----------------------------------"
AGENT_DETAILS=$(curl -s -X GET "$BASE_URL/api/agents/$TERMINAL_ID")
echo "Response:"
echo "$AGENT_DETAILS" | python3 -m json.tool 2>/dev/null || echo "$AGENT_DETAILS"
echo ""

# Test 4: Create Payment Session
echo "Test 4: Create Payment Session (E-shop checkout)"
echo "------------------------------------------------"
SESSION_RESPONSE=$(curl -s -X POST $BASE_URL/api/payments/terminal/create-session \
  -H "Content-Type: application/json" \
  -d "{
    \"terminalAgentId\": \"$TERMINAL_ID\",
    \"merchantId\": \"eshop_12345\",
    \"merchantName\": \"My E-Shop\",
    \"amount\": 99.50,
    \"currency\": \"USD\",
    \"paymentMethod\": \"revolut_card\",
    \"cartData\": {
      \"items\": [
        {\"name\": \"Product A\", \"quantity\": 2, \"price\": 29.99},
        {\"name\": \"Product B\", \"quantity\": 1, \"price\": 39.52}
      ],
      \"total\": 99.50
    },
    \"redirectUrl\": \"https://myeshop.com/order/success\",
    \"metadata\": {
      \"orderId\": \"ORDER-2025-001\",
      \"webhookUrl\": \"https://myeshop.com/webhook/payment\"
    }
  }")

echo "Response:"
echo "$SESSION_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SESSION_RESPONSE"
echo ""

# Extract session ID
SESSION_ID=$(echo "$SESSION_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ Payment Session ID: $SESSION_ID"
echo ""

# Test 5: Get Payment Session Details
echo "Test 5: Get Payment Session Details"
echo "------------------------------------"
SESSION_DETAILS=$(curl -s -X GET "$BASE_URL/api/payments/terminal/session/$SESSION_ID")
echo "Response:"
echo "$SESSION_DETAILS" | python3 -m json.tool 2>/dev/null || echo "$SESSION_DETAILS"
echo ""

# Test 6: Complete Payment
echo "Test 6: Complete Payment (Simulated)"
echo "-------------------------------------"
COMPLETE_RESPONSE=$(curl -s -X POST $BASE_URL/api/payments/terminal/complete \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"revolutPaymentId\": \"revolut_pay_simulated_12345\",
    \"userWallet\": \"0x1234567890abcdef\",
    \"paymentProof\": \"simulated_proof_data\"
  }")

echo "Response:"
echo "$COMPLETE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$COMPLETE_RESPONSE"
echo ""

# Test 7: Create and Cancel Session
echo "Test 7: Create and Cancel Payment Session"
echo "------------------------------------------"
CANCEL_SESSION=$(curl -s -X POST $BASE_URL/api/payments/terminal/create-session \
  -H "Content-Type: application/json" \
  -d "{
    \"terminalAgentId\": \"$TERMINAL_ID\",
    \"merchantId\": \"eshop_12345\",
    \"merchantName\": \"My E-Shop\",
    \"amount\": 50.00,
    \"currency\": \"USD\",
    \"paymentMethod\": \"crypto\",
    \"token\": \"USDC\"
  }")

CANCEL_SESSION_ID=$(echo "$CANCEL_SESSION" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created session to cancel: $CANCEL_SESSION_ID"

CANCEL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/payments/terminal/cancel/$CANCEL_SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{"reason": "User abandoned cart"}')

echo "Cancel Response:"
echo "$CANCEL_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CANCEL_RESPONSE"
echo ""

# Test 8: List All Agents
echo "Test 8: List All Agents"
echo "-----------------------"
ALL_AGENTS=$(curl -s -X GET "$BASE_URL/api/agents")
echo "Response:"
echo "$ALL_AGENTS" | python3 -m json.tool 2>/dev/null || echo "$ALL_AGENTS"
echo ""

# Test 9: List Only Terminal Agents
echo "Test 9: List Only Terminal Agents"
echo "----------------------------------"
TERMINAL_AGENTS=$(curl -s -X GET "$BASE_URL/api/agents?type=payment_terminal")
echo "Response:"
echo "$TERMINAL_AGENTS" | python3 -m json.tool 2>/dev/null || echo "$TERMINAL_AGENTS"
echo ""

echo "========================================"
echo "✅ All Tests Complete!"
echo "========================================"
