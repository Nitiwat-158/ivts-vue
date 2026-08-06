const path = require('path');
const dotenv = require('dotenv');

const envPath = process.env.DOTENV_CONFIG_PATH || path.resolve(__dirname, '.env.local');
console.log('cwd:', process.cwd());
console.log('envPath:', envPath);
const result = dotenv.config({ path: envPath });
console.log('dotenv result:', result);
console.log('AI_TRACK_DATABASE_URL:', process.env.AI_TRACK_DATABASE_URL);
console.log('typeof URL:', typeof process.env.AI_TRACK_DATABASE_URL);
console.log('AI_TRACK_DB_PASSWORD:', process.env.AI_TRACK_DB_PASSWORD);
console.log('typeof PASS:', typeof process.env.AI_TRACK_DB_PASSWORD);

const { Pool } = require('pg');
const connUrl = process.env.AI_TRACK_DATABASE_URL || process.env.AI_TRACK_DATABASE_URL_STRING;
const poolConfig = connUrl ? { connectionString: connUrl } : {
  user: process.env.AI_TRACK_DB_USER || process.env.DB_USER || 'postgres',
  host: process.env.AI_TRACK_DB_HOST || process.env.DB_HOST || 'localhost',
  database: process.env.AI_TRACK_DB_NAME || process.env.DB_NAME || 'mfu_vehicle_track',
  password: process.env.AI_TRACK_DB_PASSWORD || process.env.DB_PASSWORD || '',
  port: process.env.AI_TRACK_DB_PORT || process.env.DB_PORT || 5432,
};
console.log('poolConfig:', poolConfig);
const pool = new Pool(poolConfig);
pool.connect().then(client => client.query('SELECT 1 as ok').then(res => {
  console.log('ping ok', res.rows);
  client.release();
  return pool.end();
})).catch(err => {
  console.error('connect err', err);
  pool.end().catch(() => {});
});
