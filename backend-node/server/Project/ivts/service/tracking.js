'use strict';

/**
 * Service: tracking
 * Business logic for querying tracking logs and tracking histories.
 *
 * Pattern follows ivts_document.js service conventions.
 */

const TrackingLog = require('../models/tracking_log.model');
const TrackingHistory = require('../models/tracking_history.model');

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

// ─── Utility helpers ──────────────────────────────────────────────────────────

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanText(value) {
  const normalized = String(value || '').trim();
  return normalized || null;
}

function cleanDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// ─── List builders ────────────────────────────────────────────────────────────

function buildLogFilter(query) {
  const filter = {};
  const vehicle_id = toNumber(query.vehicle_id, null);
  const from = cleanDate(query.from);
  const to = cleanDate(query.to);

  if (Number.isFinite(vehicle_id)) filter.vehicle_id = vehicle_id;

  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = from;
    if (to) filter.timestamp.$lte = to;
  }

  return filter;
}

function buildHistoryFilter(query) {
  const filter = {};
  const user_id = cleanText(query.user_id);
  const vehicle_id = toNumber(query.vehicle_id, null);
  const from = cleanDate(query.from);
  const to = cleanDate(query.to);

  if (user_id) filter.user_id = user_id;
  if (Number.isFinite(vehicle_id)) filter.vehicle_id = vehicle_id;

  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = from;
    if (to) filter.timestamp.$lte = to;
  }

  return filter;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * List tracking logs with pagination, vehicle filter, and date range.
 */
exports.listLogs = async function listLogs(query) {
  const page = Math.max(toNumber(query.page, 1), 1);
  const limit = Math.min(Math.max(toNumber(query.limit, DEFAULT_LIMIT), 1), MAX_LIMIT);
  const skip = (page - 1) * limit;
  const filter = buildLogFilter(query || {});

  const [rows, total] = await Promise.all([
    TrackingLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
    TrackingLog.countDocuments(filter)
  ]);

  return { rows, total, page, limit, hasMore: skip + rows.length < total };
};

/**
 * List tracking histories with pagination, user/vehicle filter, and date range.
 */
exports.listHistory = async function listHistory(query) {
  const page = Math.max(toNumber(query.page, 1), 1);
  const limit = Math.min(Math.max(toNumber(query.limit, DEFAULT_LIMIT), 1), MAX_LIMIT);
  const skip = (page - 1) * limit;
  const filter = buildHistoryFilter(query || {});

  const [rows, total] = await Promise.all([
    TrackingHistory.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
    TrackingHistory.countDocuments(filter)
  ]);

  return { rows, total, page, limit, hasMore: skip + rows.length < total };
};
