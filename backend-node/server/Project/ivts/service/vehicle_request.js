'use strict';

/**
 * Service: vehicle_request
 * Business logic for request submission, admin review, and automatic
 * vehicle/owner synchronisation on approval.
 *
 * Pattern follows ivts_document.js service conventions.
 */

const Request = require('../models/request.model');
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

function cleanDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Extract the current user_id from the request context.
 * Follows the existing pattern: `request.body.accounts` holds the logged-in
 * account's internal ID (set by the auth middleware chain).
 */
function userIdFromRequest(request) {
  return (
    (request && request.body && request.body.accounts) ||
    (request && request.currentAccount && request.currentAccount._id) ||
    null
  );
}

/**
 * Generate a sequential-style request ID.
 * Format: req_<year>_<5-digit-padded-count>
 */
async function generateRequestId() {
  const year = new Date().getFullYear();
  const prefix = `req_${year}_`;
  const count = await Request.countDocuments({
    _id: { $regex: `^${prefix}` }
  });
  const padded = String(count + 1).padStart(5, '0');
  return `${prefix}${padded}`;
}

// ─── Priority order logic ─────────────────────────────────────────────────────

/**
 * Determine priority_order for the submitting user.
 * "first_car" if the user has no prior approved or pending vehicles,
 * "subsequent_car" otherwise.
 */
async function resolvePriorityOrder(userId) {
  const existingApproved = await Request.countDocuments({
    user_id: userId,
    request_status: { $in: ['approved', 'pending_review'] },
    request_type: { $in: ['register', 'renew'] }
  });
  return existingApproved === 0 ? 'first_car' : 'subsequent_car';
}

// ─── Input sanitisation ───────────────────────────────────────────────────────

function sanitizeVehicleInfo(body) {
  const vi = body.vehicle_info || {};
  return {
    license_plate: cleanText(vi.license_plate),
    province_license: cleanText(vi.province_license),
    brand: cleanText(vi.brand),
    model: cleanText(vi.model),
    color: cleanText(vi.color),
    vehicle_type: ['car', 'motorcycle'].includes(vi.vehicle_type) ? vi.vehicle_type : 'car'
    // priority_order is set by the service — not accepted from client
  };
}

function sanitizeOwnerInfo(body) {
  const oi = body.owner_info || {};
  return {
    name: cleanText(oi.name),
    surname: cleanText(oi.surname),
    citizen_id: cleanText(oi.citizen_id),
    is_owner_match_user: Boolean(oi.is_owner_match_user)
  };
}

function sanitizeUploadedDocuments(body) {
  const docs = body.uploaded_documents || {};
  return {
    registration_book_url: cleanText(docs.registration_book_url),
    vehicle_photo_url: cleanText(docs.vehicle_photo_url),
    citizen_card_url: cleanText(docs.citizen_card_url)
  };
}

// ─── List / query builder ─────────────────────────────────────────────────────

function buildListFilter(query) {
  const filter = {};
  const status = cleanText(query.status);
  const request_type = cleanText(query.request_type);
  const user_id = cleanText(query.user_id);

  if (status && status !== 'all') filter.request_status = status;
  if (request_type && request_type !== 'all') filter.request_type = request_type;
  if (user_id) filter.user_id = user_id;

  return filter;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * List requests with pagination and filters.
 */
exports.list = async function list(query) {
  const page = Math.max(toNumber(query.page, 1), 1);
  const limit = Math.min(Math.max(toNumber(query.limit, DEFAULT_LIMIT), 1), MAX_LIMIT);
  const skip = (page - 1) * limit;
  const filter = buildListFilter(query || {});

  const [rows, total] = await Promise.all([
    Request.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
    Request.countDocuments(filter)
  ]);

  return { rows, total, page, limit, hasMore: skip + rows.length < total };
};

/**
 * Get a single request by ID.
 */
exports.getById = async function getById(id) {
  const doc = await Request.findById(id).lean();
  if (!doc) {
    const error = new Error('Request not found');
    error.status = 404;
    throw error;
  }
  return doc;
};

/**
 * POST /requests/submit
 * Authenticated users submit a vehicle registration or renewal application.
 * The service resolves priority_order automatically.
 */
exports.submit = async function submit(body, request) {
  const userId = userIdFromRequest(request);
  if (!userId) {
    const error = new Error('Missing account context');
    error.status = 401;
    throw error;
  }

  const request_type = cleanText(body.request_type);
  const user_type = cleanText(body.user_type);

  if (!['register', 'renew'].includes(request_type)) {
    const error = new Error('request_type must be "register" or "renew"');
    error.status = 400;
    throw error;
  }
  if (!['student', 'staff', 'outsider'].includes(user_type)) {
    const error = new Error('user_type must be "student", "staff", or "outsider"');
    error.status = 400;
    throw error;
  }

  const vehicle_info = sanitizeVehicleInfo(body);
  if (!vehicle_info.license_plate) {
    const error = new Error('vehicle_info.license_plate is required');
    error.status = 400;
    throw error;
  }

  // Resolve priority order before creating the document
  const priority_order = await resolvePriorityOrder(userId);
  vehicle_info.priority_order = priority_order;

  const _id = await generateRequestId();
  const now = new Date();

  const doc = await Request.create({
    _id,
    user_id: userId,
    request_type,
    request_status: 'pending_review',
    user_type,
    vehicle_info,
    owner_info: sanitizeOwnerInfo(body),
    uploaded_documents: sanitizeUploadedDocuments(body),
    validity: { duration_years: 1, start_date: null, expiry_date: null },
    created_at: now,
    updated_at: now
  });

  return doc.toObject();
};

/**
 * PUT /requests/:id/review  (admin only)
 * Approve or reject a request. On approval:
 *   1. Sets validity.start_date = now, validity.expiry_date = now + 1 year.
 *   2. Upserts a Vehicle document.
 *   3. Upserts an OwnerVehicle document.
 */
exports.review = async function review(id, body, request) {
  const new_status = cleanText(body.request_status);
  const allowed_statuses = ['approved', 'rejected', 'expired'];
  if (!allowed_statuses.includes(new_status)) {
    const error = new Error(`request_status must be one of: ${allowed_statuses.join(', ')}`);
    error.status = 400;
    throw error;
  }

  const existing = await Request.findById(id);
  if (!existing) {
    const error = new Error('Request not found');
    error.status = 404;
    throw error;
  }

  const now = new Date();
  const updatePayload = {
    request_status: new_status,
    updated_at: now
  };

  // ── Automatic approval logic ──────────────────────────────────────────────
  if (new_status === 'approved') {
    const expiryDate = new Date(now);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    updatePayload['validity.duration_years'] = 1;
    updatePayload['validity.start_date'] = now;
    updatePayload['validity.expiry_date'] = expiryDate;

    // ── Data synchronicity guardrail: sync vehicles + owner_vehicles ──────
    await _syncVehicleOnApproval(existing, now);
  }

  const updated = await Request.findByIdAndUpdate(
    id,
    { $set: updatePayload },
    { new: true, runValidators: true }
  ).lean();

  return updated;
};

/**
 * Internal helper: upsert Vehicle and OwnerVehicle records when a request
 * is approved, granting the vehicle instant perimeter clearance status.
 *
 * @param {Document} requestDoc - The existing request Mongoose document.
 * @param {Date} now
 */
async function _syncVehicleOnApproval(requestDoc, now) {
  const vi = requestDoc.vehicle_info || {};
  const oi = requestDoc.owner_info || {};

  if (!vi.license_plate) return; // nothing to sync without a plate

  // Upsert vehicle by license_plate + province_license + user_id
  const vehicleFilter = {
    user_id: requestDoc.user_id,
    license_plate: vi.license_plate
  };
  if (vi.province_license) vehicleFilter.province_license = vi.province_license;

  const vehicleUpdate = {
    $set: {
      user_id: requestDoc.user_id,
      license_plate: vi.license_plate,
      province_license: vi.province_license || null,
      brand: vi.brand || null,
      model: vi.model || null,
      color: vi.color || null
    }
  };

  const vehicleDoc = await Vehicle.findOneAndUpdate(vehicleFilter, vehicleUpdate, {
    new: true,
    upsert: true,
    runValidators: true
  });

  if (!vehicleDoc || !vehicleDoc._id) return;

  // Upsert owner_vehicle by vehicle_id
  const ownerFilter = { vehicle_id: vehicleDoc._id };
  const ownerUpdate = {
    $set: {
      vehicle_id: vehicleDoc._id,
      owner_name: oi.name || null,
      owner_surname: oi.surname || null,
      citizen_id: oi.citizen_id || null,
      vehicle_image_url: (requestDoc.uploaded_documents || {}).vehicle_photo_url || null,
      certificate_image_url: (requestDoc.uploaded_documents || {}).registration_book_url || null
    }
  };

  await OwnerVehicle.findOneAndUpdate(ownerFilter, ownerUpdate, {
    new: true,
    upsert: true,
    runValidators: true
  });
}
