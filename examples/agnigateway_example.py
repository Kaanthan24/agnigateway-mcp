#!/usr/bin/env python3
"""
AgniGateway MCP — Python example
Search travel products and get booking URLs using the public MCP endpoint.

Requirements: pip install requests
Usage: python agnigateway_example.py
"""

import requests
import json

MCP_URL = "https://api.agnigateway.com/mcp/v1/public/mcp"


def call_tool(tool_name: str, arguments: dict, req_id: int = 1) -> dict:
    """Call an AgniGateway MCP tool."""
    payload = {
        "jsonrpc": "2.0",
        "id": req_id,
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        }
    }
    response = requests.post(MCP_URL, json=payload)
    response.raise_for_status()
    result = response.json()
    # Parse the text content from the MCP response
    content = result.get("result", {}).get("content", [{}])[0].get("text", "{}")
    return json.loads(content)


def search_travel(query: str, product_type: str = None, limit: int = 5) -> list:
    """Search for travel products using natural language."""
    arguments = {"query": query, "limit": limit}
    if product_type:
        arguments["filters"] = {"product_type": product_type}
    result = call_tool("search_travel", arguments)
    return result.get("products", [])


def get_offer_detail(source_id: str) -> dict:
    """Get full enriched details for a specific product."""
    return call_tool("get_offer_detail", {"source_id": source_id})


def initiate_booking(source_id: str) -> dict:
    """Generate a tracked affiliate booking URL."""
    return call_tool("initiate_booking", {"source_id": source_id})


def check_availability(source_id: str) -> dict:
    """Check current availability status."""
    return call_tool("check_availability", {"source_id": source_id})


if __name__ == "__main__":

    print("=" * 60)
    print("AgniGateway MCP — Python Example")
    print("=" * 60)

    # ── Example 1: Search flights ──────────────────────────────
    print("\n✈️  Searching for flights to Tokyo...")
    flights = search_travel("flights to Tokyo", product_type="flight", limit=3)
    for f in flights:
        print(f"\n  {f.get('name')}")
        print(f"  Price: {f.get('currency')} {f.get('price')}")
        print(f"  Summary: {f.get('agent_summary')}")
        print(f"  AI Score: {f.get('ai_readiness_score')}/100")
        print(f"  Book: {f.get('affiliate_url')}")

    # ── Example 2: Search yacht charters ──────────────────────
    print("\n\n🛥️  Searching for yacht charters in Greece...")
    yachts = search_travel("yacht charter Greece Mediterranean", limit=2)
    for y in yachts:
        print(f"\n  {y.get('name')}")
        print(f"  Summary: {y.get('agent_summary')}")
        print(f"  Tags: {', '.join(y.get('semantic_tags', []))}")
        print(f"  Book: {y.get('affiliate_url')}")

    # ── Example 3: Get detail + booking URL ───────────────────
    if yachts:
        source_id = yachts[0].get("source_id")
        print(f"\n\n📋 Getting booking URL for: {source_id}")
        booking = initiate_booking(source_id)
        print(f"  Transaction ID: {booking.get('transaction_id')}")
        print(f"  Booking URL: {booking.get('booking_url')}")

    # ── Example 4: Search tours ───────────────────────────────
    print("\n\n🎯 Searching for tours in Istanbul...")
    tours = search_travel("tours activities Istanbul", product_type="tour", limit=3)
    for t in tours:
        print(f"\n  {t.get('name')}")
        print(f"  Summary: {t.get('agent_summary')}")
        print(f"  Price: {t.get('currency')} {t.get('price')}")

    print("\n" + "=" * 60)
    print("Done. Full docs at https://agnigateway.com")
    print("=" * 60)
