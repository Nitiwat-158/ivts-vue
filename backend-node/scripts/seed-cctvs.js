#!/usr/bin/env node
'use strict';

require('dotenv').config({
  path: process.env.DOTENV_CONFIG_PATH || process.env.dotenv_config_path || undefined
});

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const configureMongoose = require('../helpers/configure-mongoose');
const config = require('../config/config');
const Cctv = require('../server/Project/ivts/models/cctv.model');

function parseMediamtxYaml(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/\t/g, '    '));
  const data = { paths: {} };
  let currentKey = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (/^paths\s*:\s*$/.test(line)) {
      continue;
    }
    const pathMatch = rawLine.match(/^([A-Za-z0-9_-]+):\s*$/);
    if (pathMatch) {
      currentKey = pathMatch[1];
      data.paths[currentKey] = {};
      continue;
    }
    const detailMatch = rawLine.match(/^\s+([A-Za-z0-9_]+):\s*(.*)$/);
    if (detailMatch && currentKey) {
      const key = detailMatch[1];
      let value = detailMatch[2].trim();
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (/^['"].*['"]$/.test(value)) value = value.slice(1, -1);
      data.paths[currentKey][key] = value;
    }
  }

  return data;
}

async function connectMongo() {
  configureMongoose(mongoose);
  await mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

async function run() {
  const yamlFile = path.resolve(__dirname, '..', '..', 'mediamtx.yml');
  if (!fs.existsSync(yamlFile)) {
    throw new Error('mediamtx.yml not found at repository root path: ' + yamlFile);
  }

  const content = fs.readFileSync(yamlFile, 'utf8');
  const doc = parseMediamtxYaml(content);
  const paths = doc.paths || {};
  const entries = Object.entries(paths);

  if (!entries.length) {
    throw new Error('No CCTV paths found in mediamtx.yml');
  }

  await connectMongo();
  console.log('Connected to MongoDB:', config.mongoURI);

  let createdCount = 0;
  for (const [mediamtxPath, values] of entries) {
    const cameraName = `Node: ${mediamtxPath}`;
    const sourceRtspUrl = values.source || null;
    const status = values.sourceOnDemand === true ? 'inactive' : 'active';
    const location = { description: values.location || 'Campus Network Node' };

    const update = {
      camera_name: cameraName,
      mediamtx_path: mediamtxPath,
      source_rtsp_url: sourceRtspUrl,
      status: status,
      location: location
    };

    await Cctv.findOneAndUpdate(
      { mediamtx_path: mediamtxPath },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    createdCount += 1;
    console.log('Seeded CCTV path:', mediamtxPath);
  }

  console.log(`Seeded ${createdCount} CCTV records from mediamtx.yml.`);
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error('CCTV seed failed:', error && error.message ? error.message : error);
  process.exit(1);
});
