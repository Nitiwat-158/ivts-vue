'use strict';

const mongoose = require('mongoose');
const EmergencyReport = require('../models/emergency_report.model');
const Vehicle = require('../models/vehicle.model');
const User = require('../models/user.model');

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
      const objectIdVehicleIds = vehicleIds
        .map(id => {
          try {
            return mongoose.Types.ObjectId.isValid(id) ? mongoose.Types.ObjectId(id) : null;
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);

      const numericVehicleIds = vehicleIds
        .map(id => Number(id))
        .filter(num => Number.isFinite(num));

      const vehicleQuery = { $or: [] };
      if (objectIdVehicleIds.length > 0) {
        vehicleQuery.$or.push({ _id: { $in: objectIdVehicleIds } });
      }
      if (numericVehicleIds.length > 0) {
        vehicleQuery.$or.push({ vehicle_numeric_id: { $in: numericVehicleIds } });
      }
      if (vehicleQuery.$or.length === 0) {
        vehicleQuery.$or.push({ _id: { $in: vehicleIds } });
      }

      vehicles = await Vehicle.find(vehicleQuery).lean();
    }
    
    if (adminIds.length > 0) {
      admins = await User.find({ _id: { $in: adminIds } }, 'username name email').lean();
    }

    const vehicleMap = Object.fromEntries(vehicles.map(v => [String(v._id), v]));
    const adminMap = Object.fromEntries(admins.map(a => [String(a._id), a]));

    const enrichedReports = reports.map(r => ({
      ...r,
      vehicle_id: vehicleMap[String(r.vehicle_id)] || null,
      assigned_admin_id: adminMap[String(r.assigned_admin_id)] || null,
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
    const reportId = req.params.id;
    const { status, adminId } = req.body;

    const report = await EmergencyReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Emergency report not found' });
    }

    if (status) report.status = status;
    if (adminId) report.assigned_admin_id = adminId;

    await report.save();

    let enrichedVehicle = null;
    let enrichedAdmin = null;

    if (report.vehicle_id) {
      enrichedVehicle = await Vehicle.findById(report.vehicle_id).lean();
    }
    if (report.assigned_admin_id) {
      enrichedAdmin = await User.findById(report.assigned_admin_id, 'username name email').lean();
    }

    const reportObj = report.toObject();
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