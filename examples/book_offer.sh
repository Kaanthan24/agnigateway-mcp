#!/bin/bash
# AgniGateway MCP — Get offer detail + initiate booking
# Usage: ./book_offer.sh <source_id>
# Example: ./book_offer.sh "aviasales-LON-KSC-2026-06"
#
# Step 1: Search for a product to get its source_id
# Step 2: Run this script with the source_id to get full details + booking URL

SOURCE_ID=${1:-"searadar-greece"}

echo "📋 Getting offer detail for: $SOURCE_ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -s -X POST https://api.agnigateway.com/mcp/v1/public/mcp \
  -H "Content-Type: application/json" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"id\": 1,
    \"method\": \"tools/call\",
    \"params\": {
      \"name\": \"get_offer_detail\",
      \"arguments\": {
        \"source_id\": \"$SOURCE_ID\"
      }
    }
  }" | jq '.result.content[0].text | fromjson'

echo ""
echo "🔗 Generating booking URL for: $SOURCE_ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -s -X POST https://api.agnigateway.com/mcp/v1/public/mcp \
  -H "Content-Type: application/json" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"id\": 2,
    \"method\": \"tools/call\",
    \"params\": {
      \"name\": \"initiate_booking\",
      \"arguments\": {
        \"source_id\": \"$SOURCE_ID\"
      }
    }
  }" | jq '.result.content[0].text | fromjson | {
    transaction_id,
    booking_url,
    partner,
    commission_rate
  }'
