// AgniGateway MCP — JavaScript / Node.js example
// Search travel products and get booking URLs using the public MCP endpoint.
//
// Requirements: Node.js 18+ (built-in fetch) or npm install node-fetch
// Usage: node agnigateway_example.js

const MCP_URL = "https://api.agnigateway.com/mcp/v1/public/mcp";

async function callTool(toolName, args, id = 1) {
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id,
      method: "tools/call",
      params: { name: toolName, arguments: args },
    }),
  });
  const data = await res.json();
  const text = data?.result?.content?.[0]?.text ?? "{}";
  return JSON.parse(text);
}

async function searchTravel(query, productType = null, limit = 5) {
  const args = { query, limit };
  if (productType) args.filters = { product_type: productType };
  const result = await callTool("search_travel", args);
  return result.products ?? [];
}

async function initiateBooking(sourceId) {
  return callTool("initiate_booking", { source_id: sourceId });
}

async function getOfferDetail(sourceId) {
  return callTool("get_offer_detail", { source_id: sourceId });
}

async function main() {
  console.log("=".repeat(60));
  console.log("AgniGateway MCP — JavaScript Example");
  console.log("=".repeat(60));

  // ── Example 1: Search flights ──────────────────────────────
  console.log("\n✈️  Searching for budget flights to Bangkok...");
  const flights = await searchTravel("budget flights to Bangkok", "flight", 3);
  for (const f of flights) {
    console.log(`\n  ${f.name}`);
    console.log(`  Price: ${f.currency} ${f.price}`);
    console.log(`  Summary: ${f.agent_summary}`);
    console.log(`  AI Score: ${f.ai_readiness_score}/100`);
    console.log(`  Book: ${f.affiliate_url}`);
  }

  // ── Example 2: Yacht charters ──────────────────────────────
  console.log("\n\n🛥️  Searching for yacht charters...");
  const yachts = await searchTravel("luxury yacht charter Greece", null, 2);
  for (const y of yachts) {
    console.log(`\n  ${y.name}`);
    console.log(`  Summary: ${y.agent_summary}`);
    console.log(`  Tags: ${(y.semantic_tags ?? []).join(", ")}`);
  }

  // ── Example 3: Booking URL ─────────────────────────────────
  if (yachts.length > 0) {
    const sourceId = yachts[0].source_id;
    console.log(`\n\n🔗 Getting booking URL for: ${sourceId}`);
    const booking = await initiateBooking(sourceId);
    console.log(`  Transaction ID: ${booking.transaction_id}`);
    console.log(`  Booking URL: ${booking.booking_url}`);
  }

  // ── Example 4: Tours ───────────────────────────────────────
  console.log("\n\n🎯 Searching for tours in Dubai...");
  const tours = await searchTravel("tours experiences Dubai", "tour", 3);
  for (const t of tours) {
    console.log(`\n  ${t.name}`);
    console.log(`  Summary: ${t.agent_summary}`);
    console.log(`  Price: ${t.currency} ${t.price}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("Done. Full docs at https://agnigateway.com");
  console.log("=".repeat(60));
}

main().catch(console.error);
