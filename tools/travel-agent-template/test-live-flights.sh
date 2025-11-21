#!/bin/bash

# Test script for querying LIVE flights via Travel Agent backend
# Flightradar24 MCP returns currently flying or today's scheduled flights

echo "🧪 Testing Travel Agent MCP with LIVE flight data"
echo "=================================================="
echo ""

# Get today's date
TODAY=$(date +%Y-%m-%d)
echo "📅 Testing with date: $TODAY"
echo ""

# Test 1: Popular route with frequent flights (LHR → JFK)
echo "Test 1: London Heathrow → New York JFK"
echo "---------------------------------------"
curl -s -X POST http://localhost:4001/api/agents/travel/query \
  -H "Content-Type: application/json" \
  -d "{\"origin\": \"LHR\", \"destination\": \"JFK\", \"date\": \"$TODAY\"}" \
  | jq -r 'if .flights then "✅ Found \(.flights | length) flights" else "❌ No flights: \(.error // .)" end'
echo ""

# Test 2: European route (AMS → BCN)
echo "Test 2: Amsterdam → Barcelona"
echo "------------------------------"
curl -s -X POST http://localhost:4001/api/agents/travel/query \
  -H "Content-Type: application/json" \
  -d "{\"origin\": \"AMS\", \"destination\": \"BCN\", \"date\": \"$TODAY\"}" \
  | jq -r 'if .flights then "✅ Found \(.flights | length) flights" else "❌ No flights: \(.error // .)" end'
echo ""

# Test 3: US domestic (LAX → SFO)
echo "Test 3: Los Angeles → San Francisco"
echo "------------------------------------"
curl -s -X POST http://localhost:4001/api/agents/travel/query \
  -H "Content-Type: application/json" \
  -d "{\"origin\": \"LAX\", \"destination\": \"SFO\", \"date\": \"$TODAY\"}" \
  | jq -r 'if .flights then "✅ Found \(.flights | length) flights" else "❌ No flights: \(.error // .)" end'
echo ""

# Test 4: BUD → BCN (your original query)
echo "Test 4: Budapest → Barcelona (original query)"
echo "----------------------------------------------"
RESPONSE=$(curl -s -X POST http://localhost:4001/api/agents/travel/query \
  -H "Content-Type: application/json" \
  -d "{\"origin\": \"BUD\", \"destination\": \"BCN\", \"date\": \"$TODAY\"}")

echo "$RESPONSE" | jq -r 'if .flights then "✅ Found \(.flights | length) flights\n\nFlight details:\n\(.flights[] | "  • \(.airline) \(.flightNumber): \(.departure.time) → \(.arrival.time)")" else "❌ No flights found\n\nResponse: \(.)" end'
echo ""

echo "=================================================="
echo "💡 NOTE: Flightradar24 MCP returns LIVE/TODAY flights only!"
echo "   If no flights found, try:"
echo "   - Different routes with more frequent service"
echo "   - Check if flights exist today for BUD → BCN"
echo "   - Use real-time flight numbers with getFlightDetails()"
