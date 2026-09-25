# mcp-adsb

adsb.lol MCP — live aircraft tracking via community ADS-B.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1683+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `aircraft_near` | Live aircraft tracking: what planes are flying overhead or near a location right now. Returns real-time ADS-B positions (altitude, ground speed, heading, vertical rate) for every aircraft within a radius of a lat/lon point. Use this for "what is flying above me" / "planes near <place>". |
| `get_aircraft` | Track a specific aircraft by its 24-bit ICAO hex address (e.g. "a835af"). Returns the live ADS-B position (lat/lon, altitude, speed, heading) of that exact airframe if it is currently transmitting. Real-time position data, not schedules. |
| `find_by_callsign` | Track a flight by its callsign (e.g. "UAL123"). Returns the live real-time ADS-B position (lat/lon, altitude, ground speed, heading) of the aircraft currently broadcasting that flight callsign. Live position, not a schedule lookup. |
| `military_aircraft` | Live military and government aircraft currently being tracked worldwide via ADS-B. Returns real-time positions (lat/lon, altitude, speed, heading) for military/government airframes transmitting right now. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "adsb": {
      "url": "https://gateway.pipeworx.io/adsb/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/adsb/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1683+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/aircraft_near \
  -H 'Content-Type: application/json' \
  -d '{"latitude":51.5,"longitude":-0.1}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/aircraft_near`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "adsb": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-adsb"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-adsb
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Adsb data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
