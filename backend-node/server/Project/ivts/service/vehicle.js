'use strict';

/**
 * Service: vehicle
 * Business logic for querying vehicles and their owner records.
 *
 * Pattern follows ivts_document.js service conventions.
 */

const Vehicle = require('../models/vehicle.model');
const OwnerVehicle = require('../models/owner_vehicle.model');

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

// ─── List / query builder ─────────────────────────────────────────────────────

function buildListFilter(query) {
  const filter = {};
  const q = cleanText(query.q);
  const user_id = cleanText(query.user_id);

  if (user_id) filter.user_id = user_id;
  if (q) {
    filter.$or = [
      { license_plate: new RegExp(q, 'i') },
      { brand: new RegExp(q, 'i') },
      { model: new RegExp(q, 'i') },
      { color: new RegExp(q, 'i') }
    ];
  }

  return filter;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * List vehicles with pagination and optional filters.
 */
exports.list = async function list(query) {
  const page = Math.max(toNumber(query.page, 1), 1);
  const limit = Math.min(Math.max(toNumber(query.limit, DEFAULT_LIMIT), 1), MAX_LIMIT);
  const skip = (page - 1) * limit;
  const filter = buildListFilter(query || {});

  const [rows, total] = await Promise.all([
    Vehicle.find(filter).sort({ _id: -1 }).skip(skip).limit(limit).lean(),
    Vehicle.countDocuments(filter)
  ]);

  return { rows, total, page, limit, hasMore: skip + rows.length < total };
};

/**
 * Get a single vehicle by ID, optionally enriched with owner data.
 */
exports.getById = async function getById(id) {
  const parsed = Number(id);
  const queryId = Number.isFinite(parsed) ? parsed : id;

  const vehicle = await Vehicle.findById(queryId).lean();
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.status = 404;
    throw error;
  }

  // Attach owner record if it exists
  const owner = await OwnerVehicle.findOne({ vehicle_id: vehicle._id }).lean();
  return Object.assign({}, vehicle, { owner: owner || null });
};
