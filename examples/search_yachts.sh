#!/bin/bash
# AgniGateway MCP — Search yacht charters
# Usage: ./search_yachts.sh [query] [limit]
# Example: ./search_yachts.sh "luxury yacht Greece September" 3

QUERY=${1:-"yacht charter Greece"}
LIMIT=${2:-3}

echo "🛥️  Searching: $QUERY"
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
