#!/bin/bash
# AgniGateway MCP — Search flights
# Usage: ./search_flights.sh [query] [limit]
# Example: ./search_flights.sh "flights from London to Tokyo under $500" 5

QUERY=${1:-"cheap flights to Bangkok"}
LIMIT=${2:-5}

echo "🔍 Searching: $QUERY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -s -X POST https://api.agnigateway.com/mcp/v1/public/mcp \
  -H "Content-Type: application/json" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"id\": 1,
    \"method\": \"tools/call\",
    \"params\": {
      \"name\": \"search_travel\",
      \"arguments\": {
        \"query\": \"$QUERY\",
        \"filters\": {
          \"product_type\": \"flight\"
        },
        \"limit\": $LIMIT
      }
    }
  }" | jq '.result.content[0].text | fromjson | .products[] | {
    name,
    price,
    currency,
    agent_summary,
    ai_readiness_score,
    affiliate_url
  }'
