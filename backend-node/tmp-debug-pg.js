const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
console.log('AI_TRACK_DATABASE_URL:', process.env.AI_TRACK_DATABASE_URL);
console.log('TYPE:', typeof process.env.AI_TRACK_DATABASE_URL);
const { Pool } = require('pg');
const poolConfig = { connectionString: process.env.AI_TRACK_DATABASE_URL };
console.log('poolConfig:', poolConfig);
const pool = new Pool(poolConfig);
pool.connect().then(client => {
  return client.query('SELECT 1 as ok').then(res => {
    console.log('ping', res.rows);
    client.release();
    return pool.end();
  });
}).catch(err => {
  console.error('connect error', err);
  pool.end().catch(()=>{});
});
