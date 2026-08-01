'use strict';

/**
 * Service: vehicle_request
 * Business logic for request submission, admin review, and automatic
 * vehicle synchronisation on approval.
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
  // Accept both 'type' (new mobile field from 2026-07-27) and 'vehicle_type' (legacy backward compat)
  const rawType = vi.type || vi.vehicle_type || '';
  return {
    license_plate: cleanText(vi.license_plate),
    province_license: cleanText(vi.province_license),
    brand: cleanText(vi.brand),
    model: cleanText(vi.model),
    color: cleanText(vi.color),
    type: ['car', 'motorcycle'].includes(rawType) ? rawType : 'car'
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
 * Approve or reject a request. On approval syncs vehicle document.
 * Body: { request_status: 'approved' | 'rejected' | 'expired' }
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

    // Sync vehicle document on approval
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
 * Generate a sequential vehicle_code in "CR0001" format.
 */
async function _generateVehicleCode() {
  const count = await Vehicle.countDocuments({});
  return 'CR' + String(count + 1).padStart(4, '0');
}

/**
 * Generate a sequential owner_vehicle ID in "OV0001" format.
 */
async function _generateOwnerVehicleId() {
  const count = await OwnerVehicle.countDocuments({});
  return 'OV' + String(count + 1).padStart(4, '0');
}

/**
 * Internal helper: upsert OwnerVehicle record when a request is approved.
 *
 * Source evidence (2026-08-01, MongoDB Compass, owner_vehicles collection):
 *   _id          : String "OV0001"
 *   vehicle_code : String "CR0001"
 *   plate_number : String "สน 1669"
 *   relationship : String "owner"
 *   is_primary   : Boolean true
 *   status       : String "active"
 *   created_at, updated_at : Date
 *   user_id      : String
 */
async function _syncOwnerVehicleOnApproval(requestDoc, vehicleCode, plateSrc, now) {
  const userId = String(requestDoc.user_id);
  const existingOwnerVeh = await OwnerVehicle.findOne({
    $or: [
      { vehicle_code: vehicleCode },
      { vehicle_id: vehicleCode },
      { plate_number: plateSrc, user_id: userId }
    ]
  });

  if (existingOwnerVeh) {
    await OwnerVehicle.findByIdAndUpdate(existingOwnerVeh._id, {
      $set: {
        vehicle_code: vehicleCode,
        vehicle_id: vehicleCode,
        plate_number: plateSrc,
        user_id: userId,
        relationship: 'owner',
        is_primary: true,
        status: 'active',
        document_status: 'Approved',
        account_status: 'Active',
        updated_at: now
      }
    }, { runValidators: false });
    console.log('[vehicle_request] OwnerVehicle updated: ' + existingOwnerVeh._id);
  } else {
    const ovId = await _generateOwnerVehicleId();
    const newOwnerVeh = {
      _id: ovId,
      vehicle_code: vehicleCode,
      vehicle_id: vehicleCode,
      plate_number: plateSrc,
      relationship: 'owner',
      is_primary: true,
      status: 'active',
      user_id: userId,
      document_status: 'Approved',
      account_status: 'Active',
      created_at: now,
      updated_at: now
    };
    try {
      await OwnerVehicle.create(newOwnerVeh);
      console.log('[vehicle_request] OwnerVehicle created: ' + ovId + ' for vehicle: ' + vehicleCode);
    } catch (err) {
      if (err.code === 11000) {
        console.warn('[vehicle_request] Duplicate OwnerVehicle ID, skipping');
      } else {
        throw err;
      }
    }
  }
}

/**
 * Internal helper: upsert Vehicle and OwnerVehicle records when a request is approved.
 *
 * Source evidence (2026-07-27, MongoDB Compass, vehicles collection):
 *   _id           : String "CR0001" (managed manually)
 *   plate_number  : String "สน 1669"
 *   vehicle_code  : String "CR0001" (same as _id)
 *   type          : String "car"|"motorcycle"
 *   brand, model, color, province_license
 *   owner_name    : String
 *   validity_start, validity_expiry : Date
 *   last_location : String
 *   updated_at, created_at : Date
 *   user_id       : String
 *
 * vehicle_info.type field: mobile app sends 'type' from 2026-07-27.
 * Legacy 'vehicle_type' stored in old requests is also handled here.
 */
async function _syncVehicleOnApproval(requestDoc, now) {
  const vi = requestDoc.vehicle_info || {};
  const oi = requestDoc.owner_info || {};

  const plateSrc = (vi.license_plate || '').trim();
  if (!plateSrc) {
    console.warn('[vehicle_request] _syncVehicleOnApproval: no license_plate — skipping');
    return;
  }

  const expiryDate = new Date(now);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  const ownerName = [oi.name, oi.surname].filter(Boolean).join(' ').trim() || null;

  // Resolve vehicle type: accept 'type' (new) or 'vehicle_type' (legacy)
  const vehicleType = vi.type || vi.vehicle_type || null;

  // Check if a vehicle with this plate_number already exists for this user
  const existing = await Vehicle.findOne({
    plate_number: plateSrc,
    user_id: String(requestDoc.user_id)
  }).lean();

  let resolvedVehicleCode = null;

  if (existing) {
    resolvedVehicleCode = existing.vehicle_code || existing._id;
    await Vehicle.findByIdAndUpdate(existing._id, {
      $set: {
        plate_number: plateSrc,
        type: vehicleType || existing.type || null,
        brand: vi.brand || existing.brand || null,
        model: vi.model || existing.model || null,
        color: vi.color || existing.color || null,
        province_license: vi.province_license || existing.province_license || null,
        owner_name: ownerName || existing.owner_name || null,
        validity_start: now,
        validity_expiry: expiryDate,
        updated_at: now
      }
    }, { runValidators: false });
    console.log('[vehicle_request] Vehicle updated: ' + existing._id + ' plate: ' + plateSrc);
  } else {
    const vehicleCode = await _generateVehicleCode();
    resolvedVehicleCode = vehicleCode;
    const newVehicle = {
      _id: vehicleCode,
      plate_number: plateSrc,
      vehicle_code: vehicleCode,
      type: vehicleType,
      brand: vi.brand || null,
      model: vi.model || null,
      color: vi.color || null,
      province_license: vi.province_license || null,
      owner_name: ownerName,
      validity_start: now,
      validity_expiry: expiryDate,
      last_location: null,
      updated_at: now,
      created_at: now,
      user_id: String(requestDoc.user_id)
    };
    try {
      await Vehicle.create(newVehicle);
      console.log('[vehicle_request] Vehicle created: ' + vehicleCode + ' plate: ' + plateSrc);
    } catch (createErr) {
      if (createErr.code === 11000) {
        console.warn('[vehicle_request] Duplicate vehicle_code, skipping');
      } else {
        throw createErr;
      }
    }
  }

  // Also sync owner_vehicles collection on approval
  if (resolvedVehicleCode) {
    await _syncOwnerVehicleOnApproval(requestDoc, resolvedVehicleCode, plateSrc, now);
  }
}

exports._syncVehicleOnApproval = _syncVehicleOnApproval;

