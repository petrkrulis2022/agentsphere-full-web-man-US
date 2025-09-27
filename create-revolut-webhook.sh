#!/bin/bash

# Create Revolut Webhook Script
# This script creates a webhook for the Revolut Merchant API

# Configuration
API_KEY="sk_ZXzrNQBu3jAgK310spMgznoZxqclcsIP7BdZmUXo-UYMAfAfbX_ANT0mZokp12st"
WEBHOOK_URL="https://your-ngrok-url.ngrok.io/api/revolut/webhook"  # Replace with your actual URL
API_BASE="https://sandbox-merchant.revolut.com/api/1.0"

# Create webhook
echo "Creating Revolut webhook..."

curl -X POST "${API_BASE}/webhooks" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "'${WEBHOOK_URL}'",
    "events": [
      "ORDER_COMPLETED",
      "ORDER_PAYMENT_DECLINED",
      "ORDER_PAYMENT_FAILED",
      "ORDER_CANCELLED"
    ]
  }' | jq '.'

echo "Webhook created! Copy the signing_secret from the response above to your .env file"