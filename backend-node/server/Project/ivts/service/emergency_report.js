'use strict';

const EmergencyReport = require('../models/emergency_report.model');
const Vehicle = require('../models/vehicle.model');
const User = require('../models/user.model');

async function loadLeanReportById(reportId) {
  const query = EmergencyReport.findById(reportId);
  if (query && typeof query.lean === 'function') {
    return query.lean();
  }
  return query;
}

function logStatusUpdate(stage, details) {
  // eslint-disable-next-line no-console
  console.info('EmergencyReportService.updateStatus', Object.assign({ stage: stage }, details || {}));
}

exports.getAll = async function(req, res) {
  try {
    const filters = {};
    if (req.query.status) {
      filters.status = req.query.status;
    }
    if (req.query.type) {
      filters.request_type = req.query.type;
    }
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      
      // 🟢 แก้ไข: ป้องกัน CastError จาก _id โดยค้นหา String ID หรือ Description แทน
      filters.$or = [
        { _id: req.query.search }, // ค้นหา _id แบบ Exact Match เพื่อไม่ให้ Regex พัง
        { description: searchRegex }
      ];
    }

    const reports = await EmergencyReport.find(filters).sort({ incident_time: -1 }).lean();

    const vehicleIds = [...new Set(reports.map(r => r.vehicle_id).filter(Boolean))];
    const adminIds = [...new Set(reports.map(r => r.assigned_admin_id).filter(Boolean))];

    let vehicles = [];
    let admins = [];
    
    if (vehicleIds.length > 0) {
      // vehicle_id in emergency_report stores vehicle_code (string e.g. "CR0001"),
      // not ObjectId — look up by vehicle_code field in the vehicles collection.
      vehicles = await Vehicle.find({ vehicle_code: { $in: vehicleIds } }).lean();
    }
    
    if (adminIds.length > 0) {
      admins = await User.find({ user_id: { $in: adminIds } }, 'username name email user_id').lean();
    }

    // Key the vehicleMap by vehicle_code so it matches emergency_report.vehicle_id
    const vehicleMap = Object.fromEntries(vehicles.map(v => [String(v.vehicle_code || v._id), v]));
    const adminMap = Object.fromEntries(admins.map(a => [String(a.user_id || a._id), a]));

    const enrichedReports = reports.map(r => ({
      ...r,
      vehicle_id: vehicleMap[String(r.vehicle_id)] || null,
      assigned_admin_id: adminMap[String(r.assigned_admin_id)] || null
    }));

    // 🟢 คืนค่าข้อมูลในรูปแบบ Standard Response 
    return res.status(200).json({
      code: 20000,
      message: 'Success',
      data: enrichedReports
    });

  } catch (error) {
    // 🟢 แก้ไข: ดึง status code อย่างปลอดภัย (เช็กทั้ง status และ statusCode)
    const statusCode = (error && (error.status || error.statusCode)) || 500;
    const errorMessage = error && error.message ? error.message : 'Internal Server Error';

    console.error('EmergencyReportService.getAll error:', {
      statusCode: statusCode,
      message: errorMessage,
      stack: error && error.stack ? error.stack : null
    });

    return res.status(statusCode).json({
      message: 'Failed to fetch emergency reports',
      error: errorMessage
    });
  }
};

exports.updateStatus = async function(req, res) {
  try {
    const reportId = String(req.params.id || '').trim();
    const payload = req.body || {};
    const status = typeof payload.status === 'string' ? payload.status.trim() : '';
    const adminId = typeof payload.adminId === 'string' ? payload.adminId.trim() : '';

    if (!reportId) {
      return res.status(400).json({ message: 'Emergency report id is required' });
    }

    if (!status && !adminId) {
      return res.status(400).json({ message: 'status or adminId is required' });
    }

    const report = await loadLeanReportById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Emergency report not found' });
    }

    logStatusUpdate('before-update', {
      reportId: reportId,
      currentStatus: report.status || null,
      currentAssignedAdminId: report.assigned_admin_id || null,
      nextStatus: status || null,
      nextAssignedAdminId: adminId || null
    });

    if (adminId && report.assigned_admin_id && String(report.assigned_admin_id) !== adminId) {
      logStatusUpdate('conflict', {
        reportId: reportId,
        currentAssignedAdminId: report.assigned_admin_id,
        attemptedAssignedAdminId: adminId
      });
      return res.status(409).json({
        message: 'Emergency report is already assigned to another admin',
        data: {
          reason: 'report_already_assigned',
          currentAssignedAdminId: report.assigned_admin_id
        }
      });
    }

    const update = { $set: {} };
    if (status) {
      update.$set.status = status;
    }
    if (adminId) {
      update.$set.assigned_admin_id = adminId;
    }

    const updateFilter = { _id: reportId };
    if (adminId) {
      updateFilter.$or = [
        { assigned_admin_id: null },
        { assigned_admin_id: '' },
        { assigned_admin_id: adminId }
      ];
    }

    const updatedReport = await EmergencyReport.findOneAndUpdate(updateFilter, update, {
      new: true,
      runValidators: true,
      context: 'query'
    });

    if (!updatedReport) {
      const currentReport = await loadLeanReportById(reportId);
      if (!currentReport) {
        return res.status(404).json({ message: 'Emergency report not found' });
      }
      logStatusUpdate('conflict-after-update', {
        reportId: reportId,
        databaseStatus: currentReport.status || null,
        databaseAssignedAdminId: currentReport.assigned_admin_id || null,
        attemptedStatus: status || null,
        attemptedAssignedAdminId: adminId || null
      });
      return res.status(409).json({
        message: 'Emergency report was changed by another request',
        data: {
          reason: 'report_update_conflict',
          status: currentReport.status || null,
          assigned_admin_id: currentReport.assigned_admin_id || null
        }
      });
    }

    const persistedReport = await loadLeanReportById(reportId);
    logStatusUpdate('after-update', {
      reportId: reportId,
      savedStatus: persistedReport && persistedReport.status ? persistedReport.status : null,
      savedAssignedAdminId: persistedReport && persistedReport.assigned_admin_id ? persistedReport.assigned_admin_id : null
    });

    let enrichedVehicle = null;
    let enrichedAdmin = null;

    if (persistedReport && persistedReport.vehicle_id) {
      // vehicle_id stores vehicle_code string (e.g. "CR0001"), not ObjectId
      enrichedVehicle = await Vehicle.findOne({ vehicle_code: persistedReport.vehicle_id }).lean();
    }
    if (persistedReport && persistedReport.assigned_admin_id) {
      enrichedAdmin = await User.findOne({ user_id: persistedReport.assigned_admin_id }, 'username name email user_id').lean();
    }

    const reportObj = Object.assign({}, persistedReport);
    reportObj.vehicle_id = enrichedVehicle || null;
    reportObj.assigned_admin_id = enrichedAdmin || null;

    return res.status(200).json({
      code: 20000,
      message: 'Update success',
      data: reportObj
    });

  } catch (error) {
    // 🟢 แก้ไข: ดึง status code อย่างปลอดภัย
    const statusCode = (error && (error.status || error.statusCode)) || 500;
    const errorMessage = error && error.message ? error.message : 'Internal Server Error';

    console.error('EmergencyReportService.updateStatus error:', {
      statusCode: statusCode,
      message: errorMessage,
      stack: error && error.stack ? error.stack : null
    });

    return res.status(statusCode).json({
      message: 'Failed to update emergency report',
      error: errorMessage
    });
  }
};