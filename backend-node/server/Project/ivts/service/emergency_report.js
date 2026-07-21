'use strict';

const EmergencyReport = require('../models/emergency_report.model');

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
      // Searching across multiple fields requires $or, or just rely on vehicle populated fields (complex).
      // For simplicity in this demo, search description or id
      filters.$or = [
        { _id: searchRegex },
        { description: searchRegex }
      ];
    }

    const reports = await EmergencyReport.find(filters).sort({ incident_time: -1 }).lean();

    const vehicleIds = [...new Set(reports.map(r => r.vehicle_id).filter(Boolean))];
    const adminIds = [...new Set(reports.map(r => r.assigned_admin_id).filter(Boolean))];

    // Using let variables to safely query without crashing if no IDs exist
    let vehicles = [];
    let admins = [];
    
    if (vehicleIds.length > 0) {
      vehicles = await Vehicle.find({ _id: { $in: vehicleIds } }).lean();
    }
    
    if (adminIds.length > 0) {
      admins = await User.find({ _id: { $in: adminIds } }, 'username name email').lean();
    }

    const vehicleMap = Object.fromEntries(vehicles.map(v => [v._id, v]));
    const adminMap = Object.fromEntries(admins.map(a => [a._id, a]));

    const enrichedReports = reports.map(r => ({
      ...r,
      vehicle_id: vehicleMap[r.vehicle_id] || null,
      assigned_admin_id: adminMap[r.assigned_admin_id] || null,
    }));

    res.json(enrichedReports);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch emergency reports', error: error.message });
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

    // Manual join for response
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

    res.json(reportObj);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update emergency report', error: error.message });
  }
};
