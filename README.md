# AgniGateway — Public MCP Travel Marketplace

[![smithery badge](https://smithery.ai/badge/agentgateway/agentgateway-marketplace)](https://smithery.ai/servers/agentgateway/agentgateway-marketplace)
![Products](https://img.shields.io/badge/products-560%2B-6c63ff)
![Protocols](https://img.shields.io/badge/protocols-MCP%20%7C%20ACP%20%7C%20UCP-00e5a0)
![Auth](https://img.shields.io/badge/auth-none%20required-brightgreen)
![Cities](https://img.shields.io/badge/cities-40%2B-blue)

**AgniGateway** is an AI-native travel marketplace exposing 560+ enriched travel products — flights, yacht charters, tours, and activities — through MCP, ACP, and UCP protocols. Built for AI buyer agents. No human browsing required.

> **Public endpoint. No API key. No signup. Just connect and search.**

---

## Quick Start

```bash
# List all tools
curl -X POST https://api.agnigateway.com/mcp/v1/public/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Search for flights
curl -X POST https://api.agnigateway.com/mcp/v1/public/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_travel","arguments":{"query":"flights to Tokyo under $500","limit":5}}}'

# Search for yacht charters
curl -X POST https://api.agnigateway.com/mcp/v1/public/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_travel","arguments":{"query":"yacht charter Greece September","limit":3}}}'
```

---

## Protocol Endpoints

| Protocol | URL | Auth |
|---|---|---|
| **MCP** (JSON-RPC 2.0) | `https://api.agnigateway.com/mcp/v1/public/mcp` | None |
| **ACP** (OpenAI-compatible) | `https://wjeqwognvxhpjdldtiva.supabase.co/functions/v1/acp-server/public/tools/invoke` | None |
| **UCP** (Google UCP) | `https://wjeqwognvxhpjdldtiva.supabase.co/functions/v1/ucp-server/marketplace/v1/public` | None |
| **Public Catalog** (JSON-LD) | `https://wjeqwognvxhpjdldtiva.supabase.co/functions/v1/public-catalog` | None |

All endpoints are public. No Bearer token required. Authenticated partner endpoints available at [agnigateway.com](https://agnigateway.com).

---

## Tools

| Tool | Description |
|---|---|
| `search_travel` | Natural language search across 560+ products. Returns `agent_summary`, `semantic_tags`, `ai_readiness_score`, `affiliate_url`. |
| `get_product_detail` | Full enriched details for a product by `source_id`. |
| `check_availability` | Current availability and price. |
| `get_policies` | Booking policies and conditions for a product. |
| `initiate_checkout` | Generate a tracked affiliate booking URL. Direct link to partner (Aviasales, Klook, Searadar) via Travelpayouts. |

---

## What's in the Catalog

**560+ products enriched with Claude Haiku across 40+ cities:**

| Type | Sources | Coverage |
|---|---|---|
| ✈️ Flights | Aviasales | 10 origins × 30 destinations |
| 🛥️ Yacht Charters | Searadar | Greece, Mediterranean |
| 🎯 Tours & Activities | Klook, Ticketnetwork, WegoTrip | 40 cities |
| 🚗 Transport Add-ons | BikesBooking, LocalRent | 40 cities |

**Cities:** Istanbul, Dubai, Paris, London, Bangkok, Singapore, New York, Tokyo, Barcelona, Amsterdam, Rome, Vienna, Prague, Budapest, Berlin, Lisbon, Athens, Cairo, Cape Town, Mumbai, Bali, Sydney, Seoul, Hong Kong, Miami, Los Angeles, Toronto, Mexico City, Rio de Janeiro, Buenos Aires, Zurich, Brussels, Copenhagen, Stockholm, Dublin, Warsaw, Kuala Lumpur, Jakarta, Manila, Nairobi + more.

Every product is enriched with:
- `agent_summary` — one-sentence description optimised for LLM reasoning
- `semantic_tags` — structured tags for filtering
- `ai_readiness_score` — 0–100 confidence score for agent use
- `comparison_highlights` — key differentiators vs alternatives
- `affiliate_url` — direct booking deep-link, commission tracked via Travelpayouts `marker=728068`

---

## Example Response

```json
{
  "source_id": "aviasales-LON-KSC-2026-06",
  "product_type": "flight",
  "name": "LON → KSC — from $44",
  "price": 44,
  "currency": "USD",
  "availability_status": "available",
  "agent_summary": "Ryanair flight LON→KSC June 2026 from $44. Budget tier, morning departure.",
  "semantic_tags": ["budget", "ryanair", "london", "krakow", "europe", "short_haul"],
  "ai_readiness_score": 72,
  "affiliate_url": "https://www.aviasales.com/search/LON0106KSC1?marker=728068"
}
```

---

## Connect via Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agnigateway": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-fetch",
        "https://api.agnigateway.com/mcp/v1/public/mcp"
      ]
    }
  }
}
```

---

## Connect via Smithery

[![Install on Smithery](https://smithery.ai/badge/agentgateway/agentgateway-marketplace)](https://smithery.ai/servers/agentgateway/agentgateway-marketplace)

---

## Discovery Files

| File | URL |
|---|---|
| `llms.txt` | [agnigateway.com/llms.txt](https://agnigateway.com/llms.txt) |
| `mcp.json` | [agnigateway.com/.well-known/mcp.json](https://agnigateway.com/.well-known/mcp.json) |
| `ai-plugin.json` | [agnigateway.com/.well-known/ai-plugin.json](https://agnigateway.com/.well-known/ai-plugin.json) |
| Public Catalog | [public-catalog](https://wjeqwognvxhpjdldtiva.supabase.co/functions/v1/public-catalog) |

---

## Architecture

```
AI Agent (Claude / ChatGPT / Perplexity / Custom)
    │
    │  MCP / ACP / UCP
    ▼
api.agnigateway.com  (Deno Deploy — Europe/AMS)
    │
    │  JSON-RPC 2.0
    ▼
Supabase Edge Functions  (eu-central-1)
    │
    ├── marketplace_products  (560+ enriched products)
    ├── marketplace_transactions  (per-booking tracking)
    └── pgvector semantic search
    │
    ▼
Travelpayouts Affiliate Network
    └── tp.media deep-links → Aviasales / Klook / Searadar / ...
```

---

## Platform

AgniGateway has two tracks:

| Track | Description |
|---|---|
| **M2M Marketplace** | This repo — travel & affiliate products for AI agents |
| **SaaS (WooCommerce)** | Make any WooCommerce store queryable by AI buyer agents |

More tracks coming. Visit [agnigateway.com](https://agnigateway.com) for the full platform.

---

## License

Commercial. Public endpoints are free to use. Partner API keys with higher limits available at [agnigateway.com](https://agnigateway.com).
