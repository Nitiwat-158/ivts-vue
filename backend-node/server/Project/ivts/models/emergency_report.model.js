'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Collection: emergency_reports
 */
const emergencyReportSchema = new Schema({
  _id: { type: String, required: true }, // The string ID from MongoDB
  vehicle_id: { type: String, ref: 'Vehicle', default: null }, // Usually string ID format in this repo
  request_type: { type: String, trim: true, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  incident_time: { type: Date, required: true },
  submitted_at: { type: Date, default: Date.now },
  description: { type: String, trim: true, default: null },
  location: { type: Schema.Types.Mixed, default: null },
  media_urls: { type: [String], default: [] },
  status: {
    type: String,
    enum: ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'OVERDUE'],
    default: 'NEW'
  },
  assigned_admin_id: { type: String, ref: 'User', default: null } // The admin user ID
}, {
  collection: 'emergency reports'
});

module.exports = mongoose.model('EmergencyReport', emergencyReportSchema, 'emergency reports');
