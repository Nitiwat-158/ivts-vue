// Quick test script to verify ai-track DB queries.
// Usage: DOTENV_CONFIG_PATH=.env.local node -r dotenv/config scripts/test-ai-track-db.js
const path = require('path');
const dotenv = require('dotenv');

const envPath = process.env.DOTENV_CONFIG_PATH || path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });
console.log('Loaded env file:', envPath);
const { Pool } = require('pg');
const adapter = require('../server/services/aiTrackAdapter');

// Use AI_TRACK_DATABASE_URL if provided, else fall back to individual env vars.
function makePoolConfig() {
  const connUrl = process.env.AI_TRACK_DATABASE_URL || process.env.AI_TRACK_DATABASE_URL_STRING;
  if (connUrl) return { connectionString: connUrl };
  return {
    user: process.env.AI_TRACK_DB_USER || process.env.DB_USER || 'postgres',
    host: process.env.AI_TRACK_DB_HOST || process.env.DB_HOST || 'localhost',
    database: process.env.AI_TRACK_DB_NAME || process.env.DB_NAME || 'mfu_vehicle_track',
    password: process.env.AI_TRACK_DB_PASSWORD || process.env.DB_PASSWORD || '',
    port: process.env.AI_TRACK_DB_PORT || process.env.DB_PORT || 5432,
  };
}

async function attemptConnect(pool) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT 1 as ok');
    return res.rows[0];
  } finally {
    client.release();
  }
}

async function run() {
  const maxAttempts = Number(process.env.AI_TRACK_DB_RETRY_MAX || 5);
  const baseDelay = Number(process.env.AI_TRACK_DB_RETRY_BASE_MS || 1000);
  const poolConfig = makePoolConfig();

  let pool = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      pool = new Pool(poolConfig);
      console.log(`Attempt ${attempt}/${maxAttempts}: connecting to Postgres...`);
      const ping = await attemptConnect(pool);
      console.log('DB ping result:', ping);
      // success - break out
      break;
    } catch (err) {
      // Redact connection details from message (avoid printing passwords)
      const msg = err && err.message ? err.message : String(err);
      console.error(`Connection attempt ${attempt} failed:`, msg.replace(/password=.*?(\s|$)/i, 'password=REDACTED '));
      if (attempt === maxAttempts) {
        console.error('All connection attempts failed. Exiting.');
        process.exitCode = 2;
        if (pool) await pool.end().catch(()=>{});
        return;
      }
      // cleanup pool before retrying
      if (pool) await pool.end().catch(()=>{});
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  try {
    console.log('Testing getRecentVehicles()');
    const recent = await adapter.getRecentVehicles(pool, 5);
    console.log('Recent vehicles sample (count):', recent.length);
    console.log(recent.slice(0,5));
  } catch (err) {
    console.error('ERROR during query:', err && err.message ? err.message : String(err));
    process.exitCode = 3;
  } finally {
    if (pool) await pool.end().catch(()=>{});
  }
}

run();
