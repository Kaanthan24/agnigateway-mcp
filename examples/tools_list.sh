#!/bin/bash
# AgniGateway MCP — List all available tools
# https://agnigateway.com

curl -X POST https://api.agnigateway.com/mcp/v1/public/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }' | jq .
