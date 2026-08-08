#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const connString = process.env.AI_TRACK_DATABASE_URL || process.env.AI_TRACK_DATABASE_URL_STRING;
  const client = new Client(connString ? { connectionString: connString } : {
    user: process.env.AI_TRACK_DB_USER || process.env.DB_USER || 'postgres',
    host: process.env.AI_TRACK_DB_HOST || process.env.DB_HOST || 'localhost',
    database: process.env.AI_TRACK_DB_NAME || process.env.DB_NAME || 'mfu_vehicle_track',
    password: process.env.AI_TRACK_DB_PASSWORD || process.env.DB_PASSWORD || '',
    port: process.env.AI_TRACK_DB_PORT || process.env.DB_PORT || 5432,
  });

  try {
    await client.connect();
    const schemaPath = path.resolve(__dirname, '../../ai-track/sql/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(sql);
    console.log('AI-track schema initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize AI-track schema:', err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main();
