#!/usr/bin/env node
// Seed ai_track_mappings from a CSV file (vehicle_id,global_id)
// Usage:
//   DOTENV_CONFIG_PATH=.env.local node -r dotenv/config scripts/seed-ai-track-mappings.js mappings.csv [--mongoUri=mongodb://...]

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

function usage() {
  console.log('Usage: node -r dotenv/config scripts/seed-ai-track-mappings.js <file.csv> [--mongoUri=mongodb://...] [--dry-run]');
  console.log('CSV format: vehicle_id,global_id');
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 1) {
    usage();
    process.exit(1);
  }

  const file = path.resolve(argv[0]);
  let mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGO_URI || process.env.MONGO;
  let dryRun = false;
  let exportDiff = null;
  let applyOnlyChanged = false;
  for (let i = 1; i < argv.length; i++) {
    if (argv[i].startsWith('--mongoUri=')) mongoUri = argv[i].split('=')[1];
    if (argv[i] === '--mongoUri' && argv[i + 1]) mongoUri = argv[i + 1];
    if (argv[i] === '--dry-run') dryRun = true;
    if (argv[i].startsWith('--dry-run')) dryRun = true;
    if (argv[i].startsWith('--export-diff=')) exportDiff = argv[i].split('=')[1];
    if (argv[i] === '--export-diff' && argv[i + 1]) exportDiff = argv[i + 1];
    if (argv[i] === '--apply-only-changed') applyOnlyChanged = true;
  }

  if (!fs.existsSync(file)) {
    console.error('File not found:', file);
    process.exit(2);
  }

  if (!mongoUri) {
    console.warn('No MongoDB URI provided via --mongoUri or env (MONGODB_URI / MONGO_URL / MONGO_URI).');
    console.warn('Attempting to continue; if connection fails, re-run with --mongoUri.');
  }

  const data = fs.readFileSync(file, 'utf8');
  const dataTrimmed = data.trim();
  const checksum = crypto.createHash('sha256').update(data, 'utf8').digest('hex');
  if (!data) {
    console.error('CSV file is empty');
    process.exit(3);
  }

  const lines = dataTrimmed.split(/\r?\n/);
  const docs = [];
  const seen = new Map();
  const duplicates = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Skip header if present
    if (i === 0 && /vehicle[_ ]?id/i.test(line) && /global[_ ]?id/i.test(line)) continue;
    // naive CSV split, supports simple quoted values
    const parts = line.match(/(?:"([^"]*)")|(?:'([^']*)')|([^,]+)/g).map(s => s.replace(/^\s+|\s+$/g, '').replace(/^"|"$|^'|'$/g, ''));
    const vehicle_id = parts[0] && parts[0].trim();
    const global_id = parts[1] && parts[1].trim();
    if (!vehicle_id || !global_id) {
      console.warn(`Skipping malformed line ${i + 1}: ${line}`);
      continue;
    }
    const globalNum = Number(global_id);
    if (Number.isNaN(globalNum)) {
      console.warn(`Skipping line ${i + 1} - global_id not a number: ${global_id}`);
      continue;
    }
    if (seen.has(vehicle_id)) {
      duplicates.push({ line: i + 1, vehicle_id, global_id: globalNum });
    }
    seen.set(vehicle_id, (seen.get(vehicle_id) || 0) + 1);
    docs.push({ vehicle_id, global_id: globalNum, created_at: new Date() });
  }

  if (docs.length === 0) {
    console.error('No valid rows to insert.');
    process.exit(4);
  }

  console.log(`File checksum (sha256): ${checksum}`);
  if (duplicates.length > 0) {
    console.warn(`Found ${duplicates.length} duplicate vehicle_id(s) in CSV. Sample:`);
    console.warn(duplicates.slice(0, 10));
  }

  if (dryRun) {
    console.log(`Dry run mode: parsed ${docs.length} mapping(s). Sample:`);
    console.log(docs.slice(0, 20));
    process.exit(0);
  }

  // preview mode: compare against DB and show diff summary
  const preview = argv.includes('--preview') || argv.includes('--diff');
  if (preview) {
    let mongoForPreview = mongoUri;
    try {
      if (!mongoForPreview) {
        console.warn('Preview requested but no Mongo URI provided; attempting default from env/local.');
      }
      if (!mongoForPreview) mongoForPreview = mongoUri;
      console.log('Connecting to MongoDB for preview...');
      await mongoose.connect(mongoForPreview || 'mongodb://localhost:27017/ivts', { useNewUrlParser: true, useUnifiedTopology: true });
      const coll = mongoose.connection.collection('ai_track_mappings');
      const ids = docs.map(d => d.vehicle_id);
      const existing = await coll.find({ vehicle_id: { $in: ids } }).toArray();
      const existingMap = new Map(existing.map(e => [e.vehicle_id, e]));
      const stats = { new: 0, changed: 0, unchanged: 0 };
      const changedSamples = [];
      const rows = [];
      for (const d of docs) {
        const e = existingMap.get(d.vehicle_id);
        let status = 'new';
        let existingVal = '';
        if (!e) {
          stats.new++;
          status = 'new';
        } else if (Number(e.global_id) !== Number(d.global_id)) {
          stats.changed++;
          status = 'changed';
          if (changedSamples.length < 10) changedSamples.push({ vehicle_id: d.vehicle_id, from: e.global_id, to: d.global_id });
        } else {
          stats.unchanged++;
          status = 'unchanged';
        }
        if (e) existingVal = e.global_id;
        rows.push({ vehicle_id: d.vehicle_id, existing_global_id: existingVal, new_global_id: d.global_id, status });
      }
      console.log('Preview diff summary:', stats);
      if (changedSamples.length) console.log('Sample changed mappings:', changedSamples);
      if (exportDiff) {
        try {
          const outPath = path.resolve(exportDiff);
          const dir = path.dirname(outPath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          const header = 'vehicle_id,existing_global_id,new_global_id,status\n';
          function escapeCsv(v) {
            if (v === null || v === undefined) return '';
            const s = String(v);
            if (/[,"\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
            return s;
          }
          const linesOut = rows.map(r => `${escapeCsv(r.vehicle_id)},${escapeCsv(r.existing_global_id)},${escapeCsv(r.new_global_id)},${escapeCsv(r.status)}`).join('\n') + '\n';
          fs.writeFileSync(outPath, header + linesOut, 'utf8');
          console.log('Exported diff CSV to', outPath);
        } catch (err) {
          console.error('Failed to write export-diff file:', err);
        }
      }
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('Preview failed:', err);
      try { await mongoose.disconnect(); } catch (e) {}
      process.exit(6);
    }
  }

  try {
    if (mongoUri) {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    } else {
      // try default local connection
      await mongoose.connect('mongodb://localhost:27017/ivts', { useNewUrlParser: true, useUnifiedTopology: true });
    }

    const coll = mongoose.connection.collection('ai_track_mappings');
    let targetDocs = docs;
    if (applyOnlyChanged) {
      console.log('apply-only-changed enabled; computing changed/new rows from DB...');
      const ids = docs.map(d => d.vehicle_id);
      const existing = await coll.find({ vehicle_id: { $in: ids } }).toArray();
      const existingMap = new Map(existing.map(e => [e.vehicle_id, e]));
      targetDocs = docs.filter(d => {
        const e = existingMap.get(d.vehicle_id);
        return !e || Number(e.global_id) !== Number(d.global_id);
      });
      console.log(`Will upsert ${targetDocs.length} row(s) of ${docs.length} total.`);
    }

    const bulk = targetDocs.map(d => ({ updateOne: { filter: { vehicle_id: d.vehicle_id }, update: { $set: d }, upsert: true } }));
    console.log(`Upserting ${targetDocs.length} mapping(s) into ai_track_mappings (upsert by vehicle_id)...`);
    const res = targetDocs.length > 0 ? await coll.bulkWrite(bulk, { ordered: false }) : { upsertedCount: 0, modifiedCount: 0 };
    console.log('Bulk write result:', { upsertedCount: res.upsertedCount || 0, modifiedCount: res.modifiedCount || 0 });
    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding mappings:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(5);
  }
}

main();
