#!/bin/bash

echo "🧪 Testing Revolut Integration - AR Cube Pay"
echo "============================================="

BASE_URL="http://localhost:3001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "\n${BLUE}📋 Test 1: Health Check${NC}"
curl -s $BASE_URL/api/health | jq .

# Test 2: Create Bank QR Order
echo -e "\n${BLUE}📋 Test 2: Create Bank QR Order${NC}"
QR_RESPONSE=$(curl -s -X POST $BASE_URL/api/revolut/create-bank-order \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test_agent_1","amount":10,"currency":"USD","agentName":"Test Agent 1"}')

echo $QR_RESPONSE | jq .

ORDER_ID=$(echo $QR_RESPONSE | jq -r '.order.order_id')
PAYMENT_URL=$(echo $QR_RESPONSE | jq -r '.order.payment_url')

if [ "$ORDER_ID" != "null" ]; then
  echo -e "${GREEN}✅ Order created: $ORDER_ID${NC}"
  echo -e "${GREEN}✅ Payment URL: $PAYMENT_URL${NC}"
else
  echo -e "${RED}❌ Failed to create order${NC}"
fi

# Test 3: Check Order Status
echo -e "\n${BLUE}📋 Test 3: Check Order Status${NC}"
curl -s $BASE_URL/api/revolut/order-status/$ORDER_ID | jq .

# Test 4: Simulate QR Payment
echo -e "\n${BLUE}📋 Test 4: Simulate QR Payment Completion${NC}"
curl -s -X POST $BASE_URL/api/revolut/test-qr-payment \
  -H "Content-Type: application/json" \
  -d "{\"order_id\":\"$ORDER_ID\",\"amount\":1000,\"currency\":\"USD\"}" | jq .

# Test 5: Create Virtual Card
echo -e "\n${BLUE}📋 Test 5: Create Virtual Card${NC}"
CARD_RESPONSE=$(curl -s -X POST $BASE_URL/api/revolut/create-virtual-card \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test_agent_1","amount":5000,"currency":"USD","cardLabel":"Test Agent Card"}')

echo $CARD_RESPONSE | jq .

CARD_ID=$(echo $CARD_RESPONSE | jq -r '.card.card_id')

if [ "$CARD_ID" != "null" ] && [ "$CARD_ID" != "" ]; then
  echo -e "${GREEN}✅ Card created: $CARD_ID${NC}"
else
  echo -e "${RED}❌ Failed to create card (may require real API - trying mock mode)${NC}"
  
  # Try mock mode
  echo -e "\n${BLUE}📋 Test 5b: Create Mock Virtual Card${NC}"
  CARD_RESPONSE=$(curl -s -X POST $BASE_URL/api/revolut/mock/create-virtual-card \
    -H "Content-Type: application/json" \
    -d '{"agentId":"test_agent_1","amount":5000,"currency":"USD","cardLabel":"Test Agent Card"}')
  
  echo $CARD_RESPONSE | jq .
  CARD_ID=$(echo $CARD_RESPONSE | jq -r '.card.card_id')
  echo -e "${GREEN}✅ Mock card created: $CARD_ID${NC}"
fi

# Test 6: Get Card Details
echo -e "\n${BLUE}📋 Test 6: Get Card Details${NC}"
CARD_DETAILS=$(curl -s $BASE_URL/api/revolut/virtual-card/$CARD_ID)
echo $CARD_DETAILS | jq .

# Test 7: Top Up Card
echo -e "\n${BLUE}📋 Test 7: Top Up Card${NC}"
TOPUP_RESPONSE=$(curl -s -X POST $BASE_URL/api/revolut/virtual-card/$CARD_ID/topup \
  -H "Content-Type: application/json" \
  -d '{"amount":2000,"currency":"USD"}')

echo $TOPUP_RESPONSE | jq .

# Test 8: Simulate Card Payment
echo -e "\n${BLUE}📋 Test 8: Simulate Card Payment${NC}"
PAYMENT_RESPONSE=$(curl -s -X POST $BASE_URL/api/revolut/test-card-payment \
  -H "Content-Type: application/json" \
  -d "{\"card_id\":\"$CARD_ID\",\"amount\":1000,\"currency\":\"USD\",\"merchant\":\"Test Merchant\"}")

echo $PAYMENT_RESPONSE | jq .

# Test 9: Freeze Card
echo -e "\n${BLUE}📋 Test 9: Freeze Card${NC}"
FREEZE_RESPONSE=$(curl -s -X POST $BASE_URL/api/revolut/virtual-card/$CARD_ID/freeze \
  -H "Content-Type: application/json" \
  -d '{"freeze":true}')

echo $FREEZE_RESPONSE | jq .

# Test 10: Unfreeze Card
echo -e "\n${BLUE}📋 Test 10: Unfreeze Card${NC}"
UNFREEZE_RESPONSE=$(curl -s -X POST $BASE_URL/api/revolut/virtual-card/$CARD_ID/freeze \
  -H "Content-Type: application/json" \
  -d '{"freeze":false}')

echo $UNFREEZE_RESPONSE | jq .

# Test 11: List Agent Cards
echo -e "\n${BLUE}📋 Test 11: List Agent Cards${NC}"
curl -s $BASE_URL/api/revolut/virtual-cards/agent/test_agent_1 | jq .

# Summary
echo -e "\n${GREEN}=============================================${NC}"
echo -e "${GREEN}✅ All tests completed!${NC}"
echo -e "${GREEN}=============================================${NC}"
echo -e "\n${BLUE}📊 Summary:${NC}"
echo -e "  - Order ID: ${GREEN}$ORDER_ID${NC}"
echo -e "  - Payment URL: ${GREEN}$PAYMENT_URL${NC}"
echo -e "  - Card ID: ${GREEN}$CARD_ID${NC}"
echo -e "\n${BLUE}💡 Next Steps:${NC}"
echo -e "  1. Open payment URL in browser to test QR code"
echo -e "  2. Use test card: 4111 1111 1111 1111"
echo -e "  3. Connect AR Viewer to test end-to-end flow"
