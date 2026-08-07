#!/usr/bin/env node
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

const envPath = process.env.DOTENV_CONFIG_PATH || path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const BASE_URL = String(process.env.BASE_URL || 'http://127.0.0.1:8095').replace(/\/+$/, '');
const API_BASE = BASE_URL.endsWith('/api/v1') ? BASE_URL : `${BASE_URL}/api/v1`;
const X_ACCESS_TOKEN = String(process.env.X_ACCESS_TOKEN || '').trim();

if (!X_ACCESS_TOKEN) {
  console.error('ERROR: X_ACCESS_TOKEN environment variable is required.');
  console.error('Usage: X_ACCESS_TOKEN=<token> BASE_URL=<base-url> node scripts/smoke-ai-track.js');
  process.exit(1);
}

function makeHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-access-token': X_ACCESS_TOKEN,
  };
}

async function request(path) {
  const url = `${API_BASE}${path}`;
  try {
    const response = await axios.get(url, { headers: makeHeaders(), validateStatus: () => true });
    return { status: response.status, data: response.data, url };
  } catch (err) {
    throw new Error(`Request failed for ${url}: ${err.message}`);
  }
}

function ensureStatus(res, expected = 200) {
  if (res.status !== expected) {
    throw new Error(`Unexpected status ${res.status} from ${res.url}: ${JSON.stringify(res.data)}`);
  }
}

async function main() {
  console.log('AI-track smoke test: using', API_BASE);

  const camerasRes = await request('/ai-track/cameras');
  ensureStatus(camerasRes);
  if (!camerasRes.data || typeof camerasRes.data !== 'object') {
    throw new Error('Expected cameras response to be a JSON object.');
  }
  const cameraCount = Object.keys(camerasRes.data).length;
  console.log(`Cameras endpoint returned ${cameraCount} entries.`);

  const recentRes = await request('/ai-track/vehicles/recent?limit=1');
  ensureStatus(recentRes);
  if (!recentRes.data || !Array.isArray(recentRes.data.vehicles)) {
    throw new Error('Expected recent vehicles response to include vehicles array.');
  }
  console.log(`Recent vehicles endpoint returned ${recentRes.data.vehicles.length} vehicles.`);

  if (recentRes.data.vehicles.length > 0) {
    const firstVehicle = recentRes.data.vehicles[0];
    if (!firstVehicle.global_id) {
      throw new Error('Expected recent vehicle item to include global_id.');
    }
    const timelineRes = await request(`/ai-track/vehicle/${encodeURIComponent(firstVehicle.global_id)}/timeline`);
    ensureStatus(timelineRes);
    if (!timelineRes.data || !Array.isArray(timelineRes.data.timeline)) {
      throw new Error('Expected timeline response to include timeline array.');
    }
    console.log(`Timeline endpoint returned ${timelineRes.data.timeline.length} records for global_id ${firstVehicle.global_id}.`);
  } else {
    console.log('No recent vehicles available; timeline check skipped.');
  }

  const fullRouteRes = await request('/ai-track/vehicles/full-route');
  ensureStatus(fullRouteRes);
  if (!fullRouteRes.data || !Array.isArray(fullRouteRes.data.vehicles)) {
    throw new Error('Expected full-route response to include vehicles array.');
  }
  console.log(`Full-route endpoint returned ${fullRouteRes.data.vehicles.length} vehicles.`);

  console.log('AI-track smoke test passed.');
}

main().catch((err) => {
  console.error('AI-track smoke test failed:', err.message || err);
  process.exit(1);
});
