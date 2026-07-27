'use strict';

/**
 * Service: owner_vehicle (Vehicle Management page)
 *
 * Source evidence (T1-T4, 2026-07-27):
 * - Live DB (MongoDB Compass):
 *   vehicles: 6 docs, _id=String("CR0001"), plate_number, vehicle_code,
 *             type, brand, model, color, owner_name, user_id,
 *             validity_start, validity_expiry, last_location
 *   requests: 2 docs, request_status="pending_review", request_type="register",
 *             embedded vehicle_info (license_plate), owner_info, uploaded_documents
 *   owner_vehicles: EMPTY — no longer used as data source
 *
 * Decisions:
 * - Read vehicles + requests directly; owner_vehicles collection is unused.
 * - document_status derived from latest request per vehicle plate_number:
 *     pending_review -> Pending
 *     approved       -> Approved
 *     rejected       -> Rejected
 *     (no request)   -> Approved
 * - approve/reject: update request_status in requests collection
 * - delete: remove from vehicles collection; requests kept as history
 * - account_status: always "Active" (vehicles collection has no such field)
 */

const Vehicle = require('../models/vehicle.model');
const Request = require('../models/request.model');
const User = require('../models/user.model');
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

async function getAdminDetails(req) {
  try {
    const result = await iamAdminClient.resolveCurrentAccount(req);
    const account = result.account || {};
    const name = account.name || '';
    const surname = account.surname || '';
    const fullName = (name + ' ' + surname).trim();
    return {
      id: account._id ? String(account._id) : 'unknown',
      name: fullName || account.email || 'Unknown Admin'
    };
  } catch (error) {
    console.error('Failed to fetch admin details from IAM', error);
    throw new Error('iam_api_unavailable');
  }
}

/**
 * Derive document_status from the latest request for a vehicle.
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
 * Build enriched row shape compatible with frontend VehicleTable.vue.
 * Keys: _id, vehicle, user, document_status, account_status, pending_request_id, registered_at
 */
function buildRow(vehicle, latestRequest, user) {
  return {
    _id: String(vehicle._id),
    vehicle: {
      _id: String(vehicle._id),
      plate_number: vehicle.plate_number || '',
      vehicle_code: vehicle.vehicle_code || '',
      type: vehicle.type || '',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      color: vehicle.color || '',
      owner_name: vehicle.owner_name || '',
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
      : { _id: vehicle.user_id || '', name: vehicle.owner_name || '', surname: '', email: '' },
    document_status: deriveDocumentStatus(latestRequest),
    account_status: 'Active',
    pending_request_id: latestRequest && latestRequest.request_status === 'pending_review'
      ? String(latestRequest._id)
      : null,
    registered_at: latestRequest ? latestRequest.created_at : (vehicle.created_at || null)
  };
}

// ─── Build requestByPlate map (latest request per license plate) ────────────

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
          { owner_name: regex }
        ];
      }

      const [allVehicles, requestByPlate] = await Promise.all([
        Vehicle.find(vehicleFilter).sort({ created_at: -1 }).lean(),
        buildRequestByPlate()
      ]);

      const userIds = [...new Set(allVehicles.map(v => v.user_id).filter(Boolean))];
      const users = userIds.length > 0
        ? await User.find({ _id: { $in: userIds } }).lean()
        : [];
      const userMap = users.reduce((m, u) => { m[String(u._id)] = u; return m; }, {});

      // Build enriched rows for stats
      const allRows = allVehicles.map(v =>
        buildRow(v, requestByPlate[v.plate_number] || null, userMap[String(v.user_id)] || null)
      );

      const stats = {
        total: allRows.length,
        pending: allRows.filter(r => r.document_status === 'Pending').length,
        approved: allRows.filter(r => r.document_status === 'Approved').length,
        rejected: allRows.filter(r => r.document_status === 'Rejected').length
      };

      // Apply document_status filter after join
      let filteredRows = allRows;
      if (document_status && document_status !== 'all') {
        filteredRows = allRows.filter(r => r.document_status === document_status);
      }

      // Pagination
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
      const latestRequest = requestByPlate[vehicle.plate_number] || null;
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

      const request = await Request.findOne({
        'vehicle_info.license_plate': vehicle.plate_number,
        request_status: 'pending_review'
      });

      if (!request) {
        return fail(res, new Error('no_pending_request_for_this_vehicle'), 409);
      }

      request.request_status = 'approved';
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
   * PATCH /api/v1/ivts/owner-vehicles/:id/reject
   * Reject the pending request for this vehicle.
   */
  async reject(req, res) {
    try {
      const vehicle = await Vehicle.findById(req.params.id).lean();
      if (!vehicle) return fail(res, new Error('vehicle_not_found'), 404);

      const request = await Request.findOne({
        'vehicle_info.license_plate': vehicle.plate_number,
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
      const latestRequest = requestByPlate[vehicle.plate_number] || null;
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
   * Export vehicles as CSV.
   */
  async exportCsv(req, res) {
    try {
      const { search } = req.query;

      const vehicleFilter = {};
      if (search && search.trim() !== '') {
        const regex = new RegExp(escapeRegex(search.trim()), 'i');
        vehicleFilter.$or = [
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
        'Vehicle Code': v.vehicle_code || String(v._id),
        'License Plate': v.plate_number || '',
        'Type': v.type || '',
        'Brand': v.brand || '',
        'Model': v.model || '',
        'Color': v.color || '',
        'Owner Name': v.owner_name || '',
        'Document Status': deriveDocumentStatus(requestByPlate[v.plate_number] || null),
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
