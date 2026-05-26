FROM node:20-slim
ENV NODE_ENV=production
# mcp-remote proxies a remote streamable-http MCP endpoint to local stdio
# so Glama can run automated safety and quality checks against the live server
CMD ["npx", "--yes", "mcp-remote@latest", "https://api.agnigateway.com/mcp/v1/public/mcp"]
