'use strict';

/**
 * Service: cctv
 * Business logic for CCTV camera management and dynamic MediaMTX stream URL generation.
 *
 * MediaMTX URL assembly is driven by environment variables so that URLs
 * never need to be hard-coded in the database.
 *
 * Expected env vars:
 *   MEDIAMTX_BASE_URL  – base host of the MediaMTX server (e.g. "http://192.168.1.10:8888")
 *   MEDIAMTX_RTSP_PORT – RTSP port for the rtsp_out URL (default: "8554")
 *
 * Pattern follows ivts_document.js service conventions.
 */

const fs = require('fs');
const path = require('path');
const Cctv = require('../models/cctv.model');

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const STREAM_HOST = process.env.STREAM_HOST || 'iam.mfu.ac.th';
const WEBRTC_PORT = process.env.STREAM_WEBRTC_PORT || '8554';
const HLS_PORT = process.env.STREAM_HLS_PORT || '8888';
const RTSP_PORT = process.env.STREAM_RTSP_PORT || '8554';
const MEDIAMTX_BASE_URL = process.env.MEDIAMTX_BASE_URL ? String(process.env.MEDIAMTX_BASE_URL).trim() : null;

const MEDIAMTX_CONFIG_PATH = path.resolve(__dirname, '../../../../../mediamtx.yml');
const MEDIAMTX_SOURCE_TO_PATH_MAP = loadMediamtxPaths();

function buildHlsProxyPath(id) {
  if (!id) return null;
  return `/api/v1/ivts/cctvs/${encodeURIComponent(String(id))}/stream/hls`;
}

function normalizeRtspUrl(value) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    parsed.username = '';
    parsed.password = '';
    return parsed.toString();
  } catch (_) {
    return String(value).trim().toLowerCase();
  }
}

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

function loadMediamtxPaths() {
  try {
    if (!fs.existsSync(MEDIAMTX_CONFIG_PATH)) {
      return {};
    }
    const body = fs.readFileSync(MEDIAMTX_CONFIG_PATH, 'utf8');
    const yaml = parseMediamtxYaml(body);
    const map = {};
    if (yaml && yaml.paths) {
      for (const [key, values] of Object.entries(yaml.paths)) {
        if (values && values.source) {
          const normalizedSource = normalizeRtspUrl(values.source);
          if (normalizedSource) {
            map[normalizedSource] = key;
          }
        }
      }
    }
    return map;
  } catch (error) {
    console.warn('Unable to load mediamtx.yml mapping:', error && error.message ? error.message : error);
    return {};
  }
}

// ─── Utility helpers ──────────────────────────────────────────────────────────

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanText(value) {
  const normalized = String(value || '').trim();
  return normalized || null;
}

function existingStreamUrl(streamUrls, key) {
  if (!streamUrls || typeof streamUrls !== 'object') return null;
  const value = streamUrls[key];
  if (!value) return null;
  try {
    return new URL(String(value).trim()).toString();
  } catch (_) {
    return String(value).trim();
  }
}

function slugifyName(value) {
  if (!value) return null;
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || null;
}

function resolveMediamtxPath(cctvDoc) {
  const explicitPath = cleanText(cctvDoc && cctvDoc.mediamtx_path);
  if (explicitPath) return explicitPath;

  const normalizedSource = normalizeRtspUrl(cctvDoc && cctvDoc.source_rtsp_url);
  if (normalizedSource && MEDIAMTX_SOURCE_TO_PATH_MAP[normalizedSource]) {
    return MEDIAMTX_SOURCE_TO_PATH_MAP[normalizedSource];
  }

  const nameSlug = slugifyName(cctvDoc && cctvDoc.camera_name);
  if (nameSlug) return nameSlug;
  return null;
}

// ─── Stream URL generation ────────────────────────────────────────────────────

/**
 * Generate dynamic stream URLs for a given mediamtx_path.
 * These are the URLs that the frontend and AI engines will consume.
 *
 * @param {string} mediamtxPath  - e.g. "main-gate-in"
 * @returns {{ webrtc: string, hls: string, rtsp_out: string }}
 */
function generateStreamUrls(mediamtxPath) {
  if (!mediamtxPath) {
    return { webrtc: null, hls: null, rtsp_out: null };
  }

  const cleanPath = String(mediamtxPath).trim().toLowerCase().replace(/_/g, '-');

  return {
    webrtc: `ws://${STREAM_HOST}:${WEBRTC_PORT}/${cleanPath}/ws`,
    hls: `https://${STREAM_HOST}:${HLS_PORT}/${cleanPath}/index.m3u8`,
    rtsp_out: `rtsp://${STREAM_HOST}:${RTSP_PORT}/${cleanPath}`
  };
}

/**
 * Attach dynamically generated stream_urls to a lean CCTV document.
 */
function enrichWithStreamUrls(doc) {
  if (!doc) return doc;

  const existingUrls = doc.stream_urls || {};
  const path = resolveMediamtxPath(doc);
  const generatedUrls = generateStreamUrls(path);

  const urls = {
    webrtc: existingUrls.webrtc || generatedUrls.webrtc,
    hls: existingUrls.hls || generatedUrls.hls,
    rtsp_out: existingUrls.rtsp_out || generatedUrls.rtsp_out
  };

  if (doc._id) {
    urls.hls_proxy = buildHlsProxyPath(doc._id);
  }

  return Object.assign({}, doc, { stream_urls: urls });
}

// ─── List / query builder ─────────────────────────────────────────────────────

function buildListFilter(query) {
  const filter = {};
  const status = cleanText(query.status);
  const q = cleanText(query.q);

  if (status && status !== 'all') filter.status = status;
  if (q) {
    filter.$or = [
      { camera_name: new RegExp(q, 'i') },
      { mediamtx_path: new RegExp(q, 'i') },
      { 'location.description': new RegExp(q, 'i') }
    ];
  }

  return filter;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * List CCTVs with pagination, filters, and enriched stream URLs.
 */
exports.list = async function list(query) {
  const page = Math.max(toNumber(query.page, 1), 1);
  const limit = Math.min(Math.max(toNumber(query.limit, DEFAULT_LIMIT), 1), MAX_LIMIT);
  const skip = (page - 1) * limit;
  const filter = buildListFilter(query || {});

  const [rawRows, total] = await Promise.all([
    Cctv.find(filter).sort({ camera_name: 1 }).skip(skip).limit(limit).lean(),
    Cctv.countDocuments(filter)
  ]);

  const rows = rawRows.map(enrichWithStreamUrls);
  return { rows, total, page, limit, hasMore: skip + rows.length < total };
};

/**
 * Get a single CCTV by ID, with dynamically generated stream URLs.
 */
exports.getById = async function getById(id) {
  const parsed = Number(id);
  const queryId = Number.isFinite(parsed) ? parsed : id;

  const doc = await Cctv.findById(queryId).lean();
  if (!doc) {
    const error = new Error('CCTV not found');
    error.status = 404;
    throw error;
  }
  return enrichWithStreamUrls(doc);
};

exports.proxyHlsStream = async function proxyHlsStream(id, request, response) {
  const parsed = Number(id);
  const queryId = Number.isFinite(parsed) ? parsed : id;
  const doc = await Cctv.findById(queryId).lean();
  if (!doc || !doc.mediamtx_path) {
    const error = new Error('CCTV not found');
    error.status = 404;
    throw error;
  }

  const mediamtxPath = resolveMediamtxPath(doc);
  const upstreamUrl = existingStreamUrl(doc.stream_urls, 'hls') || generateStreamUrls(mediamtxPath).hls;
  if (!upstreamUrl) {
    const error = new Error('HLS upstream URL unavailable');
    error.status = 502;
    throw error;
  }

  const parsedUpstream = new URL(upstreamUrl);
  if (MEDIAMTX_BASE_URL) {
    const allowedHost = new URL(MEDIAMTX_BASE_URL).host;
    if (parsedUpstream.host !== allowedHost) {
      const error = new Error('Invalid upstream host');
      error.status = 403;
      throw error;
    }
  }

  const client = parsedUpstream.protocol === 'https:' ? require('https') : require('http');
  const upstreamOptions = {
    method: 'GET',
    headers: {
      accept: request.headers.accept || '*/*',
      'user-agent': request.headers['user-agent'] || 'node-proxy'
    }
  };

  const upstreamReq = client.request(parsedUpstream, upstreamOptions, (upstreamRes) => {
    response.statusCode = upstreamRes.statusCode || 502;
    Object.entries(upstreamRes.headers || {}).forEach(([key, value]) => {
      if (key && value && key.toLowerCase() !== 'transfer-encoding') {
        response.setHeader(key, value);
      }
    });
    upstreamRes.pipe(response);
  });

  upstreamReq.on('error', (err) => {
    response.statusCode = 502;
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ message: 'Failed to proxy HLS stream', error: String(err) }));
  });

  upstreamReq.end();
};

/**
 * Expose the URL generation helper so it can be tested in isolation.
 */
exports.generateStreamUrls = generateStreamUrls;
