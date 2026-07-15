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

const Cctv = require('../models/cctv.model');

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const MEDIAMTX_BASE_URL = (process.env.MEDIAMTX_BASE_URL || 'http://localhost:8888').replace(/\/$/, '');
const MEDIAMTX_RTSP_PORT = process.env.MEDIAMTX_RTSP_PORT || '8554';

// Strip protocol+host to get just hostname for RTSP builds
function mediamtxHost() {
  try {
    return new URL(MEDIAMTX_BASE_URL).hostname;
  } catch (_) {
    return 'localhost';
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
  const path = String(mediamtxPath).trim();
  return {
    webrtc: `${MEDIAMTX_BASE_URL}/${path}`,          // WebRTC/WebSocket endpoint
    hls: `${MEDIAMTX_BASE_URL}/${path}/index.m3u8`,  // HLS M3U8 for browser compat
    rtsp_out: `rtsp://${mediamtxHost()}:${MEDIAMTX_RTSP_PORT}/${path}` // RTSP for AI engines
  };
}

/**
 * Attach dynamically generated stream_urls to a lean CCTV document.
 */
function enrichWithStreamUrls(doc) {
  if (!doc) return doc;
  const urls = generateStreamUrls(doc.mediamtx_path);
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

/**
 * Expose the URL generation helper so it can be tested in isolation.
 */
exports.generateStreamUrls = generateStreamUrls;
