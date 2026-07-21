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

    const reports = await EmergencyReport.find(filters)
      .populate('vehicle_id')
      .populate('assigned_admin_id', 'username name email')
      .sort({ incident_time: -1 });

    res.json(reports);
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

    // Populate for response
    await report.populate('vehicle_id');
    await report.populate('assigned_admin_id', 'username name email');

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update emergency report', error: error.message });
  }
};
