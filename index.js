/**
 * AgniGateway Marketplace — local MCP server
 *
 * Connects directly to Supabase and exposes marketplace inventory
 * via MCP stdio transport. Used by Glama for safety/quality checks.
 *
 * Required env vars:
 *   SUPABASE_URL      — Supabase project URL
 *   SUPABASE_ANON_KEY — Supabase public anon key
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
)

const server = new Server(
  { name: 'agnigateway-marketplace', version: '1.0.1' },
  { capabilities: { tools: {} } },
)

const TOOLS = [
  {
    name: 'search_travel',
    description: 'Search travel products — flights, tours, yacht charters, activities and local transport — using natural language. Returns enriched results with agent_summary, semantic_tags, price, and affiliate booking URL.',
    inputSchema: {
      type: 'object',
      properties: {
        query:  { type: 'string',  description: 'Natural language search query, e.g. "yacht charter Greece"' },
        type:   { type: 'string',  description: 'Filter by product type', enum: ['flight', 'tour', 'addon'] },
        limit:  { type: 'integer', description: 'Number of results (default 5, max 20)', default: 5 },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_offer_detail',
    description: 'Get full enriched details for a specific product by its source_id.',
    inputSchema: {
      type: 'object',
      properties: {
        source_id: { type: 'string', description: 'Product source_id returned by search_travel' },
      },
      required: ['source_id'],
    },
  },
  {
    name: 'check_availability',
    description: 'Check current availability status for a product.',
    inputSchema: {
      type: 'object',
      properties: {
        source_id: { type: 'string', description: 'Product source_id' },
      },
      required: ['source_id'],
    },
  },
  {
    name: 'initiate_booking',
    description: 'Get a direct affiliate booking URL for a product. Links go to the partner (Searadar, Klook, Aviasales, etc.) with tracking.',
    inputSchema: {
      type: 'object',
      properties: {
        source_id: { type: 'string', description: 'Product source_id' },
      },
      required: ['source_id'],
    },
  },
]

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case 'search_travel': {
        let q = supabase
          .from('marketplace_products')
          .select('source_id, name, product_type, price, currency, availability_status, agent_summary, semantic_tags, affiliate_url, ai_readiness_score')
          .eq('availability_status', 'available')
          .limit(Math.min(Number(args.limit ?? 5), 20))
        if (args.type)  q = q.eq('product_type', args.type)
        if (args.query) q = q.ilike('name', `%${args.query}%`)
        const { data, error } = await q
        if (error) throw error
        return { content: [{ type: 'text', text: JSON.stringify({ products: data ?? [], result_count: (data ?? []).length }, null, 2) }] }
      }

      case 'get_offer_detail': {
        const { data, error } = await supabase
          .from('marketplace_products')
          .select('*')
          .eq('source_id', String(args.source_id))
          .single()
        if (error) return { content: [{ type: 'text', text: JSON.stringify({ error: 'Product not found' }) }] }
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
      }

      case 'check_availability': {
        const { data, error } = await supabase
          .from('marketplace_products')
          .select('source_id, name, availability_status, price, currency')
          .eq('source_id', String(args.source_id))
          .single()
        if (error) return { content: [{ type: 'text', text: JSON.stringify({ error: 'Product not found' }) }] }
        return { content: [{ type: 'text', text: JSON.stringify({ available: data.availability_status === 'available', ...data }, null, 2) }] }
      }

      case 'initiate_booking': {
        const { data, error } = await supabase
          .from('marketplace_products')
          .select('source_id, name, affiliate_url, price, currency')
          .eq('source_id', String(args.source_id))
          .single()
        if (error || !data) return { content: [{ type: 'text', text: JSON.stringify({ error: 'Product not found' }) }] }
        if (!data.affiliate_url) return { content: [{ type: 'text', text: JSON.stringify({ error: 'No booking URL available for this product' }) }] }
        return { content: [{ type: 'text', text: JSON.stringify({ booking_url: data.affiliate_url, product: data.name, price: data.price, currency: data.currency }, null, 2) }] }
      }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (err) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }) }] }
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
