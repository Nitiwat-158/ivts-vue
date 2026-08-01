'use strict';

/**
 * Service: owner_vehicle (Vehicle Management page)
 *
 * Source evidence (2026-07-27):
 * - vehicle.model.js schema fields: license_plate (required), province_license,
 *   brand, model, color, user_id, cctv_id, vehicle_numeric_id (auto-increment)
 *   Extra fields stored as-is by _syncVehicleOnApproval: owner_name, validity_start,
 *   validity_expiry, updated_at
 * - Older IVTS registry vehicles use plate_number / vehicle_code / type fields.
 *   Both schemas coexist in the vehicles collection — use helpers to handle both.
 * - requests collection uses vehicle_info.license_plate as the plate join key.
 * - owner_vehicles collection: EMPTY — not used as data source.
 *
 * Join key: vehiclePlateKey(v) returns v.license_plate || v.plate_number
 *   This handles both old IVTS registry docs and new registration system docs.
 */

const Vehicle = require('../models/vehicle.model');
const Request = require('../models/request.model');
const User = require('../models/user.model');
const vehicleRequestService = require('./vehicle_request');
const iamAdminClient = require('../../security/service/iam-admin-client');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ok(res, data) {
  return res.status(200).json({ status: true, ...data });
}

function fail(res, err, statusCode = 500) {
  const message = err && err.message ? err.message : String(err);
  return res.status(statusCode).json({ status: false, error: message });
}

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const escapeCell = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
    return str;
  };
  const headerRow = headers.map(escapeCell).join(',');
  const rows = data.map(row => headers.map(h => escapeCell(row[h])).join(','));
  return [headerRow, ...rows].join('\n');
}

/**
 * Get the effective license plate from a vehicle document.
 * Primary field is plate_number (matching live DB schema confirmed 2026-07-27).
 */
function vehiclePlateKey(v) {
  return v.plate_number || v.license_plate || '';
}

/**
 * Get the display plate for a vehicle.
 */
function vehiclePlateDisplay(v) {
  return v.plate_number || v.license_plate || '';
}

/**
 * Derive document_status from the latest request for a vehicle.
 * pending_review -> Pending
 * approved       -> Approved
 * rejected       -> Rejected
 * (no request)   -> Approved  (vehicle exists without a pending request = registered)
 */
function deriveDocumentStatus(latestRequest) {
  if (!latestRequest) return 'Approved';
  const s = latestRequest.request_status;
  if (s === 'pending_review') return 'Pending';
  if (s === 'approved') return 'Approved';
  if (s === 'rejected') return 'Rejected';
  return 'Approved';
}

/**
 * Build enriched row shape compatible with VehicleTable.vue.
 * Handles both old (plate_number / vehicle_code / type) and new (license_plate / brand / model) vehicles.
 */
function buildRow(vehicle, latestRequest, user) {
  const plate = vehiclePlateDisplay(vehicle);
  const ownerDisplay = vehicle.owner_name ||
    (user ? [user.name, user.surname].filter(Boolean).join(' ') : '');

  return {
    _id: String(vehicle._id),
    vehicle: {
      _id: String(vehicle._id),
      plate_number: plate,
      vehicle_code: vehicle.vehicle_code || '',
      type: vehicle.type || '',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      color: vehicle.color || '',
      province_license: vehicle.province_license || '',
      owner_name: ownerDisplay,
      validity_start: vehicle.validity_start || null,
      validity_expiry: vehicle.validity_expiry || null,
      last_location: vehicle.last_location || null
    },
    user: user
      ? {
          _id: String(user._id),
          name: user.name || '',
          surname: user.surname || '',
          email: user.email || ''
        }
      : { _id: vehicle.user_id || '', name: ownerDisplay, surname: '', email: '' },
    document_status: deriveDocumentStatus(latestRequest),
    account_status: 'Active',
    pending_request_id: latestRequest && latestRequest.request_status === 'pending_review'
      ? String(latestRequest._id)
      : null,
    registered_at: latestRequest ? latestRequest.created_at : (vehicle.created_at || null)
  };
}

// ─── Build requestByPlate map (latest request per license plate) ────────────
// Join key = vehicle_info.license_plate (from requests) vs vehiclePlateKey(vehicle)

async function buildRequestByPlate() {
  const requests = await Request.find({}).sort({ created_at: -1 }).lean();
  const map = {};
  for (const r of requests) {
    const plate = r.vehicle_info && r.vehicle_info.license_plate
      ? String(r.vehicle_info.license_plate).trim()
      : null;
    if (plate && !map[plate]) {
      map[plate] = r; // sorted desc -> first = latest
    }
  }
  return map;
}

// ─── Service class ────────────────────────────────────────────────────────────

class OwnerVehicleService {

  /**
   * GET /api/v1/ivts/owner-vehicles
   * List all vehicles enriched with latest request status, user info, and stats.
   */
  async getAll(req, res) {
    try {
      const { search, document_status, page = 1, limit = 25 } = req.query;

      const vehicleFilter = {};
      if (search && search.trim() !== '') {
        const regex = new RegExp(escapeRegex(search.trim()), 'i');
        vehicleFilter.$or = [
          { plate_number: regex },
          { vehicle_code: regex },
          { owner_name: regex },
          { brand: regex },
          { model: regex }
        ];
      }

      const [allVehicles, allRequests] = await Promise.all([
        Vehicle.find(vehicleFilter).sort({ created_at: -1 }).lean(),
        Request.find({}).sort({ created_at: -1 }).lean()
      ]);

      const requestByPlate = {};
      for (const r of allRequests) {
        const plate = r.vehicle_info && r.vehicle_info.license_plate
          ? String(r.vehicle_info.license_plate).trim()
          : null;
        if (plate && !requestByPlate[plate]) {
          requestByPlate[plate] = r; // sorted desc -> first = latest
        }
      }

      const userIds = [...new Set(allVehicles.map(v => v.user_id).filter(Boolean))];
      const users = userIds.length > 0
        ? await User.find({ _id: { $in: userIds } }).lean()
        : [];
      const userMap = users.reduce((m, u) => { m[String(u._id)] = u; return m; }, {});

      // Build enriched rows — join on vehiclePlateKey
      const allRows = allVehicles.map(v =>
        buildRow(v, requestByPlate[vehiclePlateKey(v)] || null, userMap[String(v.user_id)] || null)
      );

      // System stats:
      // total: total registered vehicles in vehicles collection
      // pending: count of pending verification requests (request_status = pending_review)
      // approved: total registered vehicles in vehicles collection
      // rejected: count of rejected requests (request_status = rejected)
      const pendingCount = allRequests.filter(r => r.request_status === 'pending_review').length;
      const rejectedCount = allRequests.filter(r => r.request_status === 'rejected').length;

      const stats = {
        total: allVehicles.length,
        pending: pendingCount,
        approved: allVehicles.length,
        rejected: rejectedCount
      };

      let filteredRows = allRows;
      if (document_status && document_status !== 'all') {
        filteredRows = allRows.filter(r => r.document_status === document_status);
      }

      const parsedPage = Math.max(1, parseInt(page, 10));
      const parsedLimit = Math.max(1, parseInt(limit, 10));
      const skip = (parsedPage - 1) * parsedLimit;
      const paginatedRows = filteredRows.slice(skip, skip + parsedLimit);

      return ok(res, { data: paginatedRows, total: filteredRows.length, stats });
    } catch (err) {
      console.error('OwnerVehicleService.getAll error:', err);
      return fail(res, err);
    }
  }

  /**
   * GET /api/v1/ivts/owner-vehicles/:id
   */
  async getById(req, res) {
    try {
      const vehicle = await Vehicle.findById(req.params.id).lean();
      if (!vehicle) return fail(res, new Error('not_found'), 404);

      const requestByPlate = await buildRequestByPlate();
      const latestRequest = requestByPlate[vehiclePlateKey(vehicle)] || null;
      const user = vehicle.user_id ? await User.findById(vehicle.user_id).lean() : null;

      return ok(res, { data: buildRow(vehicle, latestRequest, user) });
    } catch (err) {
      return fail(res, err);
    }
  }

  /**
   * PATCH /api/v1/ivts/owner-vehicles/:id/approve
   * Approve the pending request for this vehicle.
   */
  async approve(req, res) {
    try {
      const vehicle = await Vehicle.findById(req.params.id).lean();
      if (!vehicle) return fail(res, new Error('vehicle_not_found'), 404);

      const plate = vehiclePlateKey(vehicle);
      const request = await Request.findOne({
        'vehicle_info.license_plate': plate,
        request_status: 'pending_review'
      });

      if (!request) {
        return fail(res, new Error('no_pending_request_for_this_vehicle'), 409);
      }

      const now = new Date();
      request.request_status = 'approved';
      request.updated_at = now;
      await request.save();

      // Trigger automatic vehicle & owner_vehicle synchronization
      await vehicleRequestService._syncVehicleOnApproval(request, now);

      const user = vehicle.user_id ? await User.findById(vehicle.user_id).lean() : null;
      return ok(res, { data: buildRow(vehicle, request.toObject(), user) });
    } catch (err) {
      if (err.message === 'iam_api_unavailable') return fail(res, err, 502);
      return fail(res, err);
    }
  }

  /**
   * PATCH /api/v1/ivts/owner-vehicles/:id/reject
   * Reject the pending request for this vehicle.
   */
  async reject(req, res) {
    try {
      const vehicle = await Vehicle.findById(req.params.id).lean();
      if (!vehicle) return fail(res, new Error('vehicle_not_found'), 404);

      const plate = vehiclePlateKey(vehicle);
      const request = await Request.findOne({
        'vehicle_info.license_plate': plate,
        request_status: 'pending_review'
      });

      if (!request) {
        return fail(res, new Error('no_pending_request_for_this_vehicle'), 409);
      }

      request.request_status = 'rejected';
      request.updated_at = new Date();
      await request.save();

      const user = vehicle.user_id ? await User.findById(vehicle.user_id).lean() : null;
      return ok(res, { data: buildRow(vehicle, request.toObject(), user) });
    } catch (err) {
      if (err.message === 'iam_api_unavailable') return fail(res, err, 502);
      return fail(res, err);
    }
  }

  /**
   * PATCH /api/v1/ivts/owner-vehicles/:id/account-status
   * No-op: vehicles collection has no account_status field.
   */
  async toggleAccountStatus(req, res) {
    try {
      const vehicle = await Vehicle.findById(req.params.id).lean();
      if (!vehicle) return fail(res, new Error('not_found'), 404);
      const requestByPlate = await buildRequestByPlate();
      const latestRequest = requestByPlate[vehiclePlateKey(vehicle)] || null;
      const user = vehicle.user_id ? await User.findById(vehicle.user_id).lean() : null;
      return ok(res, { data: buildRow(vehicle, latestRequest, user) });
    } catch (err) {
      return fail(res, err);
    }
  }

  /**
   * DELETE /api/v1/ivts/owner-vehicles/:id
   * Remove vehicle from vehicles collection; requests kept as history.
   */
  async remove(req, res) {
    try {
      const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
      if (!vehicle) return fail(res, new Error('not_found'), 404);
      return ok(res, { deleted: true });
    } catch (err) {
      return fail(res, err);
    }
  }

  /**
   * GET /api/v1/ivts/owner-vehicles/export
   */
  async exportCsv(req, res) {
    try {
      const { search } = req.query;

      const vehicleFilter = {};
      if (search && search.trim() !== '') {
        const regex = new RegExp(escapeRegex(search.trim()), 'i');
        vehicleFilter.$or = [
          { license_plate: regex },
          { plate_number: regex },
          { vehicle_code: regex },
          { owner_name: regex }
        ];
      }

      const [vehicles, requestByPlate] = await Promise.all([
        Vehicle.find(vehicleFilter).sort({ created_at: -1 }).lean(),
        buildRequestByPlate()
      ]);

      const csvData = vehicles.map(v => ({
        'License Plate': vehiclePlateDisplay(v),
        'Vehicle Code': v.vehicle_code || v.vehicle_numeric_id || String(v._id),
        'Type': v.type || v.vehicle_type || '',
        'Brand': v.brand || '',
        'Model': v.model || '',
        'Color': v.color || '',
        'Owner Name': v.owner_name || '',
        'Province': v.province_license || '',
        'Document Status': deriveDocumentStatus(requestByPlate[vehiclePlateKey(v)] || null),
        'Validity Start': v.validity_start ? new Date(v.validity_start).toISOString() : '',
        'Validity Expiry': v.validity_expiry ? new Date(v.validity_expiry).toISOString() : '',
        'Last Location': v.last_location || ''
      }));

      const csvString = convertToCSV(csvData);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="vehicles.csv"');
      return res.status(200).send(csvString);
    } catch (err) {
      return fail(res, err);
    }
  }
}

module.exports = new OwnerVehicleService();
