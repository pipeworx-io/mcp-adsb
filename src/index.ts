interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * adsb.lol MCP — live aircraft tracking via community ADS-B.
 *
 * Real-time aircraft positions (altitude, speed, heading) crowdsourced from
 * ADS-B receivers. This is LIVE position data, NOT flight schedules.
 * Keyless public API. Base: https://api.adsb.lol/v2
 */


const BASE = 'https://api.adsb.lol/v2';
const UA = 'pipeworx/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'aircraft_near',
    description:
      'Live aircraft tracking: what planes are flying overhead or near a location right now. Returns real-time ADS-B positions (altitude, ground speed, heading, vertical rate) for every aircraft within a radius of a lat/lon point. Use this for "what is flying above me" / "planes near <place>".',
    inputSchema: {
      type: 'object',
      properties: {
        latitude: { type: 'number', description: 'Center latitude in decimal degrees, e.g. 51.5.' },
        longitude: { type: 'number', description: 'Center longitude in decimal degrees, e.g. -0.1.' },
        radius_nm: { type: 'number', description: 'Search radius in nautical miles (default 25, max 250).' },
      },
      required: ['latitude', 'longitude'],
    },
  },
  {
    name: 'get_aircraft',
    description:
      'Track a specific aircraft by its 24-bit ICAO hex address (e.g. "a835af"). Returns the live ADS-B position (lat/lon, altitude, speed, heading) of that exact airframe if it is currently transmitting. Real-time position data, not schedules.',
    inputSchema: {
      type: 'object',
      properties: {
        hex: { type: 'string', description: "24-bit ICAO hex address, e.g. 'a835af'." },
      },
      required: ['hex'],
    },
  },
  {
    name: 'find_by_callsign',
    description:
      'Track a flight by its callsign (e.g. "UAL123"). Returns the live real-time ADS-B position (lat/lon, altitude, ground speed, heading) of the aircraft currently broadcasting that flight callsign. Live position, not a schedule lookup.',
    inputSchema: {
      type: 'object',
      properties: {
        callsign: { type: 'string', description: "Flight callsign, e.g. 'UAL123'." },
      },
      required: ['callsign'],
    },
  },
  {
    name: 'military_aircraft',
    description:
      'Live military and government aircraft currently being tracked worldwide via ADS-B. Returns real-time positions (lat/lon, altitude, speed, heading) for military/government airframes transmitting right now.',
    inputSchema: { type: 'object', properties: {} },
  },
];

const mapAc = (a: Record<string, unknown>) => ({
  hex: a.hex,
  flight: ((a.flight as string) || '').trim(),
  registration: a.r,
  type: a.t,
  lat: a.lat,
  lon: a.lon,
  alt_baro_ft: a.alt_baro,
  ground_speed_kt: a.gs,
  track_deg: a.track,
  vert_rate_fpm: a.baro_rate,
  squawk: a.squawk,
  category: a.category,
  emergency: a.emergency,
  seen_s: a.seen,
});

interface AdsbResponse {
  ac?: Record<string, unknown>[];
  total?: number;
  now?: number;
  error?: number;
  message?: string;
}

async function adsbGet(path: string): Promise<AdsbResponse> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) {
    const message = await res.text().catch(() => '');
    return { error: res.status, message };
  }
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

function reqNum(args: Record<string, unknown>, key: string, example: string): number {
  const v = args[key];
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`Required argument "${key}" is missing. Pass a number like ${example}.`);
  return v;
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'aircraft_near': {
      const lat = reqNum(args, 'latitude', '51.5');
      const lon = reqNum(args, 'longitude', '-0.1');
      let radius = typeof args.radius_nm === 'number' && Number.isFinite(args.radius_nm) ? args.radius_nm : 25;
      if (radius > 250) radius = 250;
      if (radius < 0) radius = 25;
      const data = await adsbGet(`/lat/${lat}/lon/${lon}/dist/${radius}`);
      if (data.error !== undefined) return data;
      const ac = data.ac || [];
      return { count: ac.length, now: data.now, aircraft: ac.slice(0, 100).map(mapAc) };
    }
    case 'get_aircraft': {
      const hex = reqStr(args, 'hex', "'a835af'").toLowerCase();
      const data = await adsbGet(`/hex/${encodeURIComponent(hex)}`);
      if (data.error !== undefined) return data;
      return { aircraft: (data.ac || []).map(mapAc) };
    }
    case 'find_by_callsign': {
      const callsign = reqStr(args, 'callsign', "'UAL123'");
      const data = await adsbGet(`/callsign/${encodeURIComponent(callsign)}`);
      if (data.error !== undefined) return data;
      return { aircraft: (data.ac || []).map(mapAc) };
    }
    case 'military_aircraft': {
      const data = await adsbGet('/mil');
      if (data.error !== undefined) return data;
      const ac = data.ac || [];
      return { count: ac.length, aircraft: ac.slice(0, 100).map(mapAc) };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
