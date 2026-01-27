#!/bin/bash

# Apply Agent Type Labels Migration to Supabase
# This script applies the agent type constraint update

echo "🚀 Applying Agent Type Labels Migration..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
    exit 1
fi

# Source environment variables
export $(cat .env | grep -v '^#' | xargs)

if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ Error: VITE_SUPABASE_URL not set in .env"
    exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: VITE_SUPABASE_ANON_KEY not set in .env"
    exit 1
fi

echo "📝 Supabase URL: $VITE_SUPABASE_URL"
echo ""

# SQL Migration
SQL_MIGRATION=$(cat <<'EOF'
-- Drop the existing constraint
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_agent_type;

-- Add updated constraint with new labels
ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_agent_type 
CHECK ((agent_type IS NULL) OR (agent_type = ANY (ARRAY[
  -- Legacy types (maintain compatibility)
  'ai_agent'::text, 
  'study_buddy'::text, 
  'tutor'::text, 
  'landmark'::text, 
  'building'::text,
  -- Enhanced agent categories (updated labels)
  'My Payment Terminal'::text,
  'Payment Terminal - POS'::text,
  'Virtual ATM'::text,
  'Intelligent Assistant'::text,
  'Local Services'::text, 
  'Payment Terminal'::text,
  'Trailing Payment Terminal'::text,
  'My Ghost'::text,
  'Game Agent'::text,
  '3D World Builder'::text,
  'Home Security'::text,
  'Content Creator'::text,
  'Real Estate Broker'::text,
  'Bus Stop Agent'::text,
  -- Previous enhanced types
  'Taxi driver'::text,
  'Travel Influencer'::text,
  -- Hedera AI Travel Agents
  '🚌 Bus Agent (Hedera AI)'::text,
  '🚆 Train Agent (Hedera AI)'::text,
  '🏨 Hotel Agent (Hedera AI)'::text,
  '✈️ Flight Agent (Hedera AI)'::text,
  '🍽️ Restaurant Agent (Hedera AI)'::text,
  '🌍 Travel Coordinator (Hedera AI)'::text
])));
EOF
)

echo "🔧 Executing migration via Supabase REST API..."

# Execute via curl
RESPONSE=$(curl -X POST "${VITE_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${VITE_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql_query\": $(echo "$SQL_MIGRATION" | jq -Rs .)}" \
  -s -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
    echo "✅ Migration applied successfully!"
    echo ""
    echo "📋 Updated Agent Type Labels:"
    echo "  1. Content Creator → My Payment Terminal"
    echo "  2. Payment Terminal → Payment Terminal - POS"
    echo "  3. Home Security → Virtual ATM"
    echo ""
    echo "  Plus all Hedera AI agent types (🚌🚆🏨✈️🍽️🌍)"
else
    echo "⚠️  API response code: $HTTP_CODE"
    echo "Response: $RESPONSE_BODY"
    echo ""
    echo "💡 Alternative method:"
    echo "   1. Go to Supabase Dashboard > SQL Editor"
    echo "   2. Open and run: update_agent_types_labels.sql"
    echo "   Or use: node apply_agent_type_labels_migration.js"
fi

echo ""
echo "✨ Done!"
