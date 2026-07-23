'use strict';

const OwnerVehicle = require('../models/owner_vehicle.model');
const Vehicle = require('../models/vehicle.model');
const User = require('../models/user.model');
const iamAdminClient = require('../../security/service/iam-admin-client');

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
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
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
    const fullName = `${name} ${surname}`.trim();
    return {
      id: account._id ? String(account._id) : 'unknown',
      name: fullName || account.email || 'Unknown Admin'
    };
  } catch (error) {
    console.error('Failed to fetch admin details from IAM', error);
    throw new Error('iam_api_unavailable');
  }
}

class OwnerVehicleService {
  async getAll(req, res) {
    try {
      const { search, document_status, account_status, page = 1, limit = 25 } = req.query;
      
      const ownerVehicleQuery = {};
      if (document_status && document_status !== 'all') {
        ownerVehicleQuery.document_status = document_status;
      }
      if (account_status && account_status !== 'all') {
        ownerVehicleQuery.account_status = account_status;
      }

      // Handle Manual Join for Search
      if (search && search.trim() !== '') {
        const regex = new RegExp(escapeRegex(search.trim()), 'i');
        
        // 1. Search in vehicles (license_plate)
        const matchedVehicles = await Vehicle.find({ license_plate: regex }).select('_id').lean();
        const matchedVehicleIds = matchedVehicles.map(v => String(v._id));
        
        // 2. Search in users (name or surname)
        const matchedUsers = await User.find({
          $or: [
            { name: regex },
            { surname: regex }
          ]
        }).select('_id').lean();
        const matchedUserIds = matchedUsers.map(u => String(u._id));

        ownerVehicleQuery.$or = [
          { vehicle_id: { $in: matchedVehicleIds } },
          { user_id: { $in: matchedUserIds } }
        ];
      }

      // Fetch global stats based on search query (but without status filter)
      const statsQuery = search && search.trim() !== '' ? { $or: ownerVehicleQuery.$or } : {};
      const [totalCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
        OwnerVehicle.countDocuments(statsQuery),
        OwnerVehicle.countDocuments({ ...statsQuery, document_status: 'Pending' }),
        OwnerVehicle.countDocuments({ ...statsQuery, document_status: 'Approved' }),
        OwnerVehicle.countDocuments({ ...statsQuery, document_status: 'Rejected' })
      ]);

      const stats = {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount
      };

      const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
      const parsedLimit = Math.max(1, parseInt(limit, 10));

      const items = await OwnerVehicle.find(ownerVehicleQuery)
        .sort({ registered_at: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean();

      // Manual population
      const vehicleIds = [...new Set(items.map(item => item.vehicle_id))];
      const userIds = [...new Set(items.map(item => item.user_id))];

      const [vehicles, users] = await Promise.all([
        Vehicle.find({ _id: { $in: vehicleIds } }).lean(),
        User.find({ _id: { $in: userIds } }).lean()
      ]);

      const vehicleMap = vehicles.reduce((map, v) => { map[String(v._id)] = v; return map; }, {});
      const userMap = users.reduce((map, u) => { map[String(u._id)] = u; return map; }, {});

      const populatedItems = items.map(item => ({
        ...item,
        vehicle: vehicleMap[String(item.vehicle_id)] || null,
        user: userMap[String(item.user_id)] || null
      }));

      return ok(res, { 
        data: populatedItems, 
        total: await OwnerVehicle.countDocuments(ownerVehicleQuery), // Total for current query filter
        stats
      });
    } catch (err) {
      return fail(res, err);
    }
  }

  async getById(req, res) {
    try {
      const item = await OwnerVehicle.findOne({ _id: req.params.id }).lean();
      if (!item) return fail(res, new Error('not_found'), 404);

      const vehicle = await Vehicle.findOne({ _id: item.vehicle_id }).lean();
      const user = await User.findOne({ _id: item.user_id }).lean();

      item.vehicle = vehicle || null;
      item.user = user || null;

      return ok(res, { data: item });
    } catch (err) {
      return fail(res, err);
    }
  }

  async approve(req, res) {
    try {
      const admin = await getAdminDetails(req);

      const logEntry = {
        time: new Date(),
        message: 'Document status changed to Approved',
        actor: admin.name
      };

      const updated = await OwnerVehicle.findOneAndUpdate(
        { _id: req.params.id, document_status: 'Pending' },
        {
          $set: {
            document_status: 'Approved',
            reviewed_by_id: admin.id,
            reviewed_by_name: admin.name,
            reviewed_at: new Date()
          },
          $push: { activity_log: logEntry }
        },
        { new: true, useFindAndModify: false }
      );

      if (!updated) {
        return fail(res, new Error('document_already_processed_or_not_found'), 409);
      }

      return ok(res, { data: updated });
    } catch (err) {
      if (err.message === 'iam_api_unavailable') return fail(res, err, 502);
      return fail(res, err);
    }
  }

  async reject(req, res) {
    try {
      const admin = await getAdminDetails(req);
      const reasons = req.body && req.body.reasons ? req.body.reasons : [];
      const note = req.body && req.body.note ? req.body.note : '';
      
      const reasonText = reasons.length > 0 ? reasons.join(', ') : 'No specific reason';
      const logMessage = note ? `Document status changed to Rejected. Reasons: ${reasonText}. Note: ${note}` : `Document status changed to Rejected. Reasons: ${reasonText}`;

      const logEntry = {
        time: new Date(),
        message: logMessage,
        actor: admin.name
      };

      const updated = await OwnerVehicle.findOneAndUpdate(
        { _id: req.params.id, document_status: 'Pending' },
        {
          $set: {
            document_status: 'Rejected',
            reviewed_by_id: admin.id,
            reviewed_by_name: admin.name,
            reviewed_at: new Date(),
            reject_reasons: reasons,
            reject_note: note
          },
          $push: { activity_log: logEntry }
        },
        { new: true, useFindAndModify: false }
      );

      if (!updated) {
        return fail(res, new Error('document_already_processed_or_not_found'), 409);
      }

      return ok(res, { data: updated });
    } catch (err) {
      if (err.message === 'iam_api_unavailable') return fail(res, err, 502);
      return fail(res, err);
    }
  }

  async toggleAccountStatus(req, res) {
    try {
      const admin = await getAdminDetails(req);
      const status = req.body && req.body.status;
      if (!['Active', 'Inactive'].includes(status)) {
        return fail(res, new Error('invalid_status'), 400);
      }

      const logEntry = {
        time: new Date(),
        message: `Account status changed to ${status}`,
        actor: admin.name
      };

      const updated = await OwnerVehicle.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: { account_status: status },
          $push: { activity_log: logEntry }
        },
        { new: true, useFindAndModify: false }
      );

      if (!updated) return fail(res, new Error('not_found'), 404);

      return ok(res, { data: updated });
    } catch (err) {
      if (err.message === 'iam_api_unavailable') return fail(res, err, 502);
      return fail(res, err);
    }
  }

  async remove(req, res) {
    try {
      const result = await OwnerVehicle.findOneAndDelete({ _id: req.params.id }, { useFindAndModify: false });
      if (!result) return fail(res, new Error('not_found'), 404);
      return ok(res, { deleted: true });
    } catch (err) {
      return fail(res, err);
    }
  }

  async exportCsv(req, res) {
    try {
      const { search, document_status, account_status } = req.query;
      
      const ownerVehicleQuery = {};
      if (document_status && document_status !== 'all') {
        ownerVehicleQuery.document_status = document_status;
      }
      if (account_status && account_status !== 'all') {
        ownerVehicleQuery.account_status = account_status;
      }

      if (search && search.trim() !== '') {
        const regex = new RegExp(escapeRegex(search.trim()), 'i');
        const matchedVehicles = await Vehicle.find({ license_plate: regex }).select('_id').lean();
        const matchedUsers = await User.find({ $or: [{ name: regex }, { surname: regex }] }).select('_id').lean();
        ownerVehicleQuery.$or = [
          { vehicle_id: { $in: matchedVehicles.map(v => String(v._id)) } },
          { user_id: { $in: matchedUsers.map(u => String(u._id)) } }
        ];
      }

      const items = await OwnerVehicle.find(ownerVehicleQuery).sort({ registered_at: -1 }).lean();

      const vehicleIds = [...new Set(items.map(item => item.vehicle_id))];
      const userIds = [...new Set(items.map(item => item.user_id))];

      const [vehicles, users] = await Promise.all([
        Vehicle.find({ _id: { $in: vehicleIds } }).lean(),
        User.find({ _id: { $in: userIds } }).lean()
      ]);

      const vehicleMap = vehicles.reduce((map, v) => { map[String(v._id)] = v; return map; }, {});
      const userMap = users.reduce((map, u) => { map[String(u._id)] = u; return map; }, {});

      const csvData = items.map(item => {
        const vehicle = vehicleMap[String(item.vehicle_id)] || {};
        const user = userMap[String(item.user_id)] || {};
        return {
          'ID': item._id,
          'License Plate': vehicle.license_plate || '',
          'Owner Name': `${user.name || ''} ${user.surname || ''}`.trim(),
          'Document Status': item.document_status,
          'Account Status': item.account_status,
          'Registered At': item.registered_at ? new Date(item.registered_at).toISOString() : '',
          'Reviewed By': item.reviewed_by_name || '',
          'Reviewed At': item.reviewed_at ? new Date(item.reviewed_at).toISOString() : ''
        };
      });

      const csvString = convertToCSV(csvData);
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="owner_vehicles.csv"');
      return res.status(200).send(csvString);
    } catch (err) {
      return fail(res, err);
    }
  }
}

module.exports = new OwnerVehicleService();
