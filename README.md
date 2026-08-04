# mcp-adsb

adsb.lol MCP — live aircraft tracking via community ADS-B.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Adsb data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
