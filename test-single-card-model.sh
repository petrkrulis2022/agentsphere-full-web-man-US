#!/bin/bash

echo "🧪 Testing Single-Card-Per-Agent Model"
echo "======================================="

BASE_URL="http://localhost:3001"

# Test 1: Create first card for agent
echo -e "\n📋 Test 1: Create first virtual card for test_agent_1"
CARD1=$(curl -s -X POST $BASE_URL/api/revolut/mock/create-virtual-card \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test_agent_1","amount":100,"currency":"USD"}')

echo "$CARD1" | python3 -m json.tool 2>/dev/null || echo "$CARD1"

CARD1_ID=$(echo "$CARD1" | grep -o '"card_id":"[^"]*"' | cut -d'"' -f4)
echo "Card ID: $CARD1_ID"

# Test 2: Try to create second card (should fail with 409)
echo -e "\n📋 Test 2: Try to create second card for same agent (should fail)"
CARD2=$(curl -s -X POST $BASE_URL/api/revolut/mock/create-virtual-card \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test_agent_1","amount":50,"currency":"USD"}')

echo "$CARD2" | python3 -m json.tool 2>/dev/null || echo "$CARD2"

# Test 3: Get primary card
echo -e "\n📋 Test 3: Get primary card for test_agent_1"
PRIMARY=$(curl -s $BASE_URL/api/revolut/mock/virtual-card/agent/test_agent_1/primary)

echo "$PRIMARY" | python3 -m json.tool 2>/dev/null || echo "$PRIMARY"

# Test 4: Get primary card for agent with no cards
echo -e "\n📋 Test 4: Get primary card for agent with no cards (should return null)"
NO_CARD=$(curl -s $BASE_URL/api/revolut/mock/virtual-card/agent/test_agent_999/primary)

echo "$NO_CARD" | python3 -m json.tool 2>/dev/null || echo "$NO_CARD"

# Test 5: Create card for different agent
echo -e "\n📋 Test 5: Create card for different agent (should succeed)"
CARD3=$(curl -s -X POST $BASE_URL/api/revolut/mock/create-virtual-card \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test_agent_2","amount":200,"currency":"EUR"}')

echo "$CARD3" | python3 -m json.tool 2>/dev/null || echo "$CARD3"

echo -e "\n✅ All tests completed!"
