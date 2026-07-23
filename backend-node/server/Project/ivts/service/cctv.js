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
const mongoose = require('mongoose');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const Cctv = require('../models/cctv.model');

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const STREAM_HOST = process.env.STREAM_HOST || 'http://localhost/' || 'iam.mfu.ac.th';
const WEBRTC_PORT = process.env.STREAM_WEBRTC_PORT || '8554';
const HLS_PORT = process.env.STREAM_HLS_PORT || '8888';
const RTSP_PORT = process.env.STREAM_RTSP_PORT || '8554';
const HLS_CACHE_DIR = path.resolve(__dirname, '../../../../hls-streams');
const HLS_PLAYLIST_NAME = 'hls.m3u8';
const HLS_TASKS = new Map();

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const MEDIAMTX_BASE_URL = process.env.MEDIAMTX_BASE_URL ? String(process.env.MEDIAMTX_BASE_URL).trim() : null;
const BASE_SERVER_URL = process.env.BASE_SERVER_URL ? String(process.env.BASE_SERVER_URL).trim().replace(/\/$/, '') : '';

const MEDIAMTX_CONFIG_PATH = path.resolve(__dirname, '../../../../../mediamtx.yml');
const MEDIAMTX_SOURCE_TO_PATH_MAP = loadMediamtxPaths();

function buildHlsProxyPath(id) {
  if (!id) return null;
  const path = `/api/v1/ivts/cctvs/${encodeURIComponent(String(id))}/stream/hls`;
  return BASE_SERVER_URL ? `${BASE_SERVER_URL}${path}` : path;
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

function ensureHlsCacheDir() {
  fs.mkdirSync(HLS_CACHE_DIR, { recursive: true });
}

function getHlsOutputDir(id) {
  return path.join(HLS_CACHE_DIR, String(id));
}

function getHlsPlaylistPath(id) {
  return path.join(getHlsOutputDir(id), HLS_PLAYLIST_NAME);
}

function getHlsFilePath(id, fileName) {
  return path.join(getHlsOutputDir(id), sanitizeHlsFileName(fileName));
}

function sanitizeHlsFileName(fileName) {
  return path.basename(String(fileName || ''));
}

async function waitForFile(filePath, timeoutMs = 6000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(filePath)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return fs.existsSync(filePath);
}

function startHlsConversion(id, rtspUrl) {
  const cameraId = String(id);
  if (!cameraId || !rtspUrl) return null;

  const existing = HLS_TASKS.get(cameraId);
  if (existing && !existing.stopped) {
    return existing;
  }

  ensureHlsCacheDir();
  const outputDir = getHlsOutputDir(cameraId);
  fs.mkdirSync(outputDir, { recursive: true });
  const playlistPath = getHlsPlaylistPath(cameraId);
  const segmentPattern = `${outputDir.replace(/\\/g, '/')}/segment_%03d.ts`;

  const task = {
    stopped: false,
    error: null,
    startedAt: Date.now()
  };

  const command = ffmpeg(rtspUrl)
    .inputOptions(['-rtsp_transport tcp', '-stimeout 3000000'])
    .outputOptions([
      '-c:v copy',
      '-c:a aac',
      '-f hls',
      '-hls_time 2',
      '-hls_list_size 5',
      '-hls_flags delete_segments+independent_segments',
      `-hls_segment_filename`, segmentPattern,
      '-hls_allow_cache 0'
    ])
    .output(playlistPath)
    .on('start', (commandLine) => {
      console.info(`HLS conversion start [${cameraId}]: ${commandLine}`);
    })
    .on('error', (error) => {
      task.error = error;
      task.stopped = true;
      console.error(`HLS conversion failed [${cameraId}]: ${error && error.message ? error.message : error}`);
    })
    .on('end', () => {
      task.stopped = true;
      console.info(`HLS conversion ended [${cameraId}]`);
    })
    .run();

  task.command = command;
  HLS_TASKS.set(cameraId, task);
  return task;
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

  // Fix: MediaMTX serves HLS over http:// (not https://) on port 8888 by default.
  // Set STREAM_HOST in .env to the actual MediaMTX server IP/hostname.
  return {
    webrtc: `ws://${STREAM_HOST}:${WEBRTC_PORT}/${cleanPath}/ws`,
    hls: `http://${STREAM_HOST}:${HLS_PORT}/${cleanPath}/index.m3u8`,
    rtsp_out: `rtsp://${STREAM_HOST}:${RTSP_PORT}/${cleanPath}`
  };
}

/**
 * Attach dynamically generated stream_urls to a lean CCTV document.
 */
function enrichWithStreamUrls(doc) {
  if (!doc) return doc;

  const existingUrls = doc.stream_urls || {};
  const mediamtxPath = resolveMediamtxPath(doc);
  const generatedUrls = generateStreamUrls(mediamtxPath);

  // Fix: ENV-generated URLs take priority over stored DB values.
  // This prevents stale or incorrectly-seeded DB stream_urls from overriding
  // the correct ENV-driven URLs. Stored values are used only as fallback
  // when ENV variables are not configured (generatedUrls fields are null).
  const urls = {
    webrtc: generatedUrls.webrtc || existingUrls.webrtc || null,
    hls: generatedUrls.hls || existingUrls.hls || null,
    rtsp_out: generatedUrls.rtsp_out || existingUrls.rtsp_out || null
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
async function findCctvByIdentifier(id) {
  if (id === undefined || id === null) {
    return null;
  }

  const rawId = String(id).trim();
  if (!rawId) {
    return null;
  }

  if (mongoose.Types.ObjectId.isValid(rawId)) {
    const doc = await Cctv.collection.findOne({ _id: new mongoose.Types.ObjectId(rawId) });
    if (doc) return doc;
  }

  const numeric = Number(rawId);
  if (Number.isFinite(numeric) && String(numeric) === rawId) {
    const doc = await Cctv.collection.findOne({ _id: numeric });
    if (doc) return doc;
  }

  let doc = await Cctv.findOne({ mediamtx_path: rawId }).lean();
  if (doc) return doc;

  doc = await Cctv.findOne({ camera_name: rawId }).lean();
  if (doc) return doc;

  return null;
}

exports.getById = async function getById(id) {
  const doc = await findCctvByIdentifier(id);
  if (!doc) {
    const error = new Error('CCTV not found');
    error.status = 404;
    throw error;
  }
  return enrichWithStreamUrls(doc);
};

exports.proxyHlsStream = async function proxyHlsStream(id, fileName, request, response) {
  const doc = await findCctvByIdentifier(id);
  if (!doc) {
    const error = new Error('CCTV not found');
    error.status = 404;
    throw error;
  }

  const requestedFile = String(fileName || 'hls').trim();
  const isPlaylist = requestedFile === 'hls' || requestedFile === HLS_PLAYLIST_NAME || requestedFile.endsWith('.m3u8');
  const sourceRtspUrl = cleanText(doc.source_rtsp_url);

  console.info(`[HLS proxy] request: id=${id}, file=${requestedFile}, playlist=${isPlaylist}, rtsp=${!!sourceRtspUrl}`);

  if (sourceRtspUrl) {
    const cameraId = String(id).trim();
    const requestedName = isPlaylist ? HLS_PLAYLIST_NAME : sanitizeHlsFileName(requestedFile);
    const targetPath = getHlsFilePath(cameraId, requestedName);

    startHlsConversion(cameraId, sourceRtspUrl);

    const waitTimeout = 8000;
    const ready = await waitForFile(targetPath, waitTimeout);
    if (!ready) {
      const errorMessage = isPlaylist
        ? 'HLS playlist is not ready yet'
        : 'HLS segment is not ready yet';
      console.warn(`[HLS proxy] missing file after wait ${waitTimeout}ms: ${targetPath}`);
      response.statusCode = 503;
      response.setHeader('content-type', 'application/json');
      return response.end(JSON.stringify({ message: errorMessage, file: requestedName }));
    }

    if (!fs.existsSync(targetPath)) {
      console.warn(`[HLS proxy] file does not exist after wait: ${targetPath}`);
      response.statusCode = 404;
      response.setHeader('content-type', 'application/json');
      return response.end(JSON.stringify({ message: 'HLS file not found', file: requestedName }));
    }

    const contentType = isPlaylist ? 'application/vnd.apple.mpegurl' : 'video/MP2T';
    response.status(200);
    response.setHeader('Content-Type', contentType);
    response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(targetPath);
      stream.on('error', (err) => {
        if (!response.headersSent) {
          response.status(500).json({ message: 'Failed to stream HLS file', error: String(err) });
        } else {
          response.end();
        }
        reject(err);
      });
      stream.on('end', resolve);
      stream.pipe(response);
    });
  }

  if (!doc.mediamtx_path) {
    const error = new Error('HLS upstream URL unavailable');
    error.status = 502;
    throw error;
  }

  const mediamtxPath = resolveMediamtxPath(doc);
  // Fix: Use ENV-generated URL first. DB-stored stream_urls may be stale.
  const upstreamUrl = generateStreamUrls(mediamtxPath).hls || existingStreamUrl(doc.stream_urls, 'hls');
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
