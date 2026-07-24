'use strict';

/**
 * Service: mobile
 * Read-only data composition for the Flutter `user-mobile-application`.
 * Reads directly from the IVTS MongoDB collections and maps them into the
 * DTO shapes consumed by the mobile app's local models (Vehicle,
 * TripHistory, RequestHistoryItem, EmergencyStatusUpdate).
 *
 * Source evidence (T1-T4, see docs/tasks/2026-07-24-mobile-mongodb-api.md):
 * - Live inspection of the `IVTS` database (docker exec mongosh) showed the
 *   `vehicles` collection currently stores a flat, mobile-ready shape
 *   (plate_number, vehicle_code, type, owner_name, validity_start,
 *   validity_expiry, last_location, updated_at, user_id) that does NOT
 *   match the declared Mongoose schema in `models/vehicle.model.js`
 *   (license_plate/vehicle_numeric_id/cctv_id are not present on the actual
 *   stored documents). Per AI-WORKFLOW rule 1 (source truth = mounted/
 *   actual data over declared schema), this service reads the real field
 *   names directly via `.lean()`.
 * - `tracking_histories` and `requests` collections are currently EMPTY in
 *   the live database, so listTripHistory/listRequestHistory legitimately
 *   return `[]` until that data is seeded — this is real "no data yet"
 *   state, not an API failure.
 * - `emergency_report` collection content matches
 *   `models/emergency_report.model.js` (vehicle_id, request_type, severity,
 *   incident_time, submitted_at, description, status, assigned_admin_id).
 *
 * Documented assumptions/limitations (recorded, not guessed):
 * 1. The mobile app has no login/IAM session yet, so these routes are
 *    mounted WITHOUT account.onCheckAuthorization (see mobile.routes.js).
 *    Callers must pass user_id explicitly. Proper mobile auth is an open
 *    follow-up — see tasklist Blocker column.
 * 2. There is no per-step timestamp audit trail for emergency_report status
 *    changes, so only the "submitted" timeline step carries a real
 *    timestamp (submitted_at); other steps are derived from `status` only.
 * 3. There is no dedicated notifications collection in MongoDB. `listNotifications`
 *    derives notification entries from data already served elsewhere in this
 *    file: vehicles nearing/past expiry ("renewal" type) and emergency_report
 *    documents ("emergency" type). There is no backend source for a
 *    "system" notification type (e.g. traffic announcements) — none are
 *    returned for it.
 */

const Vehicle = require('../models/vehicle.model');
const TrackingHistory = require('../models/tracking_history.model');
const Request = require('../models/request.model');
const EmergencyReport = require('../models/emergency_report.model');

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

function formatDateBE(date) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear() + 543; // Buddhist year, matches existing mock UI convention
  return `${dd}/${mm}/${yyyy}`;
}

function formatTime(date) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

function daysBetween(from, to) {
  const ms = to.getTime() - from.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function dateGroupLabel(date) {
  if (!date) return null;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date);
  const startOfDateOnly = new Date(startOfDate.getFullYear(), startOfDate.getMonth(), startOfDate.getDate());
  const diffDays = Math.round((startOfToday - startOfDateOnly) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  const months = Math.floor(diffDays / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

function vehicleTypeLabel(type) {
  const normalized = String(type || '').trim().toLowerCase();
  return normalized === 'motorcycle' ? 'Motorcycle' : 'Car';
}

function deriveVehicleStatus(expiryDate) {
  if (!expiryDate) return 'pending';
  const days = daysBetween(new Date(), new Date(expiryDate));
  if (days < 0) return 'expired';
  if (days <= 30) return 'expiringSoon';
  return 'active';
}

/**
 * Match a user_id filter against both numeric and string storage, since the
 * live `vehicles` collection stores user_id as Number while older
 * records/schemas use String.
 */
function userIdFilterValue(userId) {
  const asNumber = Number(userId);
  return Number.isFinite(asNumber) ? { $in: [asNumber, String(userId)] } : userId;
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────

function mapVehicle(v) {
  const expiryDate = v.validity_expiry || null;
  const now = new Date();
  const daysUntilExpiry = expiryDate ? daysBetween(now, new Date(expiryDate)) : 0;
  const lastLocation = v.last_location || null;
  const updatedAt = v.updated_at || null;

  return {
    id: String(v._id),
    plateNumber: v.plate_number || '',
    vehicleCode: v.vehicle_code || String(v._id),
    type: vehicleTypeLabel(v.type),
    brand: v.brand || '',
    model: v.model || '',
    color: v.color || '',
    ownerName: v.owner_name || '',
    issueDate: formatDateBE(v.validity_start) || '',
    expiryDate: formatDateBE(expiryDate) || '',
    daysUntilExpiry,
    status: deriveVehicleStatus(expiryDate),
    lastLocation: lastLocation
      ? `${lastLocation}${updatedAt ? ` (updated ${formatTime(updatedAt)})` : ''}`
      : 'No location data yet',
    lastUpdatedTime: updatedAt ? formatTime(updatedAt) : ''
  };
}

function buildVehicleFilter(query) {
  const filter = {};
  const userId = cleanText(query.user_id);
  const q = cleanText(query.q);

  if (userId) filter.user_id = userIdFilterValue(userId);
  if (q) {
    filter.$or = [
      { plate_number: new RegExp(q, 'i') },
      { vehicle_code: new RegExp(q, 'i') },
      { brand: new RegExp(q, 'i') },
      { model: new RegExp(q, 'i') }
    ];
  }
  return filter;
}

exports.listVehicles = async function listVehicles(query) {
  const page = Math.max(toNumber(query.page, 1), 1);
  const limit = Math.min(Math.max(toNumber(query.limit, DEFAULT_LIMIT), 1), MAX_LIMIT);
  const skip = (page - 1) * limit;
  const filter = buildVehicleFilter(query || {});

  const vehicles = await Vehicle.find(filter).sort({ _id: 1 }).skip(skip).limit(limit).lean();
  return vehicles.map(mapVehicle);
};

exports.getVehicleById = async function getVehicleById(id) {
  // Vehicle documents store `_id` as a plain string (e.g. "CR0001"), but the
  // Mongoose schema does not override the default ObjectId `_id` type, so
  // `Vehicle.findById()` would attempt an ObjectId cast and throw a
  // CastError. Query the native collection directly to bypass that cast —
  // consistent with the live-schema evidence documented at the top of this
  // file.
  const vehicle = await Vehicle.collection.findOne({ _id: id });
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.status = 404;
    throw error;
  }
  return mapVehicle(vehicle);
};

// ─── Tracking / trip history ──────────────────────────────────────────────────
// tracking_histories is empty in the live database at the time of writing —
// this legitimately returns [] until tracking events are recorded.

exports.listTripHistory = async function listTripHistory(query) {
  const filter = {};
  const userId = cleanText(query.user_id);
  const vehicleId = cleanText(query.vehicle_id);
  if (userId) filter.user_id = userIdFilterValue(userId);
  if (vehicleId) filter.vehicle_id = vehicleId;

  const limit = Math.min(Math.max(toNumber(query.limit, DEFAULT_LIMIT), 1), MAX_LIMIT);
  const histories = await TrackingHistory.find(filter).sort({ timestamp: -1 }).limit(limit).lean();
  if (!histories.length) return [];

  const vehicleIds = [...new Set(histories.map((h) => h.vehicle_id).filter(Boolean))];
  const vehicles = vehicleIds.length ? await Vehicle.find({ _id: { $in: vehicleIds } }).lean() : [];
  const vehicleMap = new Map(vehicles.map((v) => [String(v._id), v]));

  return histories.map((h) => {
    const vehicle = vehicleMap.get(String(h.vehicle_id)) || null;
    return {
      vehicleCode: vehicle ? vehicle.plate_number || vehicle.vehicle_code : '',
      vehicleId: vehicle ? String(vehicle._id) : String(h.vehicle_id),
      dateGroup: dateGroupLabel(h.timestamp) || '',
      date: formatDateBE(h.timestamp) || '',
      time: formatTime(h.timestamp) || ''
    };
  });
};

// ─── Request history ──────────────────────────────────────────────────────────
// requests is empty in the live database at the time of writing — this
// legitimately returns [] until registration/renewal requests are submitted.

exports.listRequestHistory = async function listRequestHistory(query) {
  const filter = {};
  const userId = cleanText(query.user_id);
  if (userId) filter.user_id = userIdFilterValue(userId);

  const limit = Math.min(Math.max(toNumber(query.limit, DEFAULT_LIMIT), 1), MAX_LIMIT);
  const requests = await Request.find(filter).sort({ created_at: -1 }).limit(limit).lean();

  return requests.map((r) => ({
    title: r.request_type === 'renew' ? 'Renewal' : 'Vehicle registration',
    vehicleCode: (r.vehicle_info && r.vehicle_info.license_plate) || '',
    vehicleId: r._id,
    date: formatDateBE(r.created_at) || '',
    dateGroup: dateGroupLabel(r.created_at) || ''
  }));
};

// ─── Emergency reports ─────────────────────────────────────────────────────────

function buildEmergencyTimeline(report) {
  const isAcknowledged = ['IN_PROGRESS', 'RESOLVED', 'CLOSED', 'OVERDUE'].includes(report.status);
  const isContacting = ['IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(report.status);

  return [
    {
      step: 'submitted',
      label: 'ส่งคำร้องเรียบร้อย',
      timestamp: formatTime(report.submitted_at) || '',
      completed: true
    },
    {
      step: 'acknowledged',
      label: 'เจ้าหน้าที่รับคำร้องแล้ว',
      timestamp: '',
      completed: isAcknowledged
    },
    {
      step: 'contacting',
      label: 'กำลังติดต่อกลับ',
      timestamp: '',
      completed: isContacting
    }
  ];
}

exports.listEmergencyReports = async function listEmergencyReports(query) {
  const filter = {};
  const vehicleId = cleanText(query.vehicle_id);
  if (vehicleId) filter.vehicle_id = vehicleId;

  const limit = Math.min(Math.max(toNumber(query.limit, DEFAULT_LIMIT), 1), MAX_LIMIT);
  const reports = await EmergencyReport.find(filter).sort({ incident_time: -1 }).limit(limit).lean();
  return reports.map((r) => Object.assign({}, r, { timeline: buildEmergencyTimeline(r) }));
};

exports.getEmergencyReportById = async function getEmergencyReportById(id) {
  const report = await EmergencyReport.findById(id).lean();
  if (!report) {
    const error = new Error('Emergency report not found');
    error.status = 404;
    throw error;
  }
  return Object.assign({}, report, { timeline: buildEmergencyTimeline(report) });
};

// ─── Notifications (derived, no dedicated collection) ─────────────────────────

exports.listNotifications = async function listNotifications(query) {
  const userId = cleanText(query.user_id);
  const vehicleId = cleanText(query.vehicle_id);

  const vehicleFilter = {};
  if (userId) vehicleFilter.user_id = userIdFilterValue(userId);
  if (vehicleId) vehicleFilter._id = vehicleId;

  const vehicles = await Vehicle.find(vehicleFilter).lean();
  const vehicleIds = vehicles.map((v) => String(v._id));

  const renewalNotifications = vehicles
    .map((v) => ({ vehicle: v, status: deriveVehicleStatus(v.validity_expiry || null) }))
    .filter(({ status }) => status === 'expiringSoon' || status === 'expired')
    .map(({ vehicle, status }) => {
      const label = vehicle.plate_number || vehicle.vehicle_code || String(vehicle._id);
      const days = vehicle.validity_expiry ? daysBetween(new Date(), new Date(vehicle.validity_expiry)) : 0;
      return {
        type: 'renewal',
        title: vehicle.vehicle_code || label,
        description: status === 'expired'
          ? `รถหมายเลขทะเบียน ${label} หมดอายุทะเบียนแล้ว`
          : `รถหมายเลขทะเบียน ${label} กำลังใกล้หมดอายุใน ${days} วัน`,
        dateGroup: 'Today'
      };
    });

  const reportFilter = {};
  if (vehicleId) {
    reportFilter.vehicle_id = vehicleId;
  } else if (userId) {
    reportFilter.vehicle_id = { $in: vehicleIds };
  }

  const reports = await EmergencyReport.find(reportFilter).sort({ submitted_at: -1 }).lean();
  const emergencyNotifications = reports.map((r) => ({
    type: 'emergency',
    title: 'Emergency report update',
    description: r.description || `Emergency report (${r.request_type}) status: ${r.status}`,
    dateGroup: dateGroupLabel(r.submitted_at) || 'Today'
  }));

  return [...emergencyNotifications, ...renewalNotifications];
};
