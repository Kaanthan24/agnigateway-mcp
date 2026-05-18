#!/bin/bash
# AgniGateway MCP — Search tours & activities
# Usage: ./search_tours.sh [query] [limit]
# Example: ./search_tours.sh "food tour Tokyo family friendly" 5

QUERY=${1:-"tours and activities in Istanbul"}
LIMIT=${2:-5}

echo "🎯 Searching: $QUERY"
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
          \"product_type\": \"tour\"
        },
        \"limit\": $LIMIT
      }
    }
  }" | jq '.result.content[0].text | fromjson | .products[] | {
    name,
    price,
    currency,
    agent_summary,
    semantic_tags,
    ai_readiness_score,
    affiliate_url
  }'
