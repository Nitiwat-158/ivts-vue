'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Collection: owner_vehicles
 * Owner identity and document image URLs for a registered vehicle.
 * PDPA: citizen_id is sensitive — access is permission-gated at the route level.
 */
const activityLogSchema = new Schema({
  time: { type: Date, default: Date.now },
  message: { type: String, required: true },
  actor: { type: String, required: true }
}, { _id: false });

const ownerVehicleSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  vehicle_id: { type: String, ref: 'Vehicle', index: true },
  vehicle_code: { type: String, trim: true },
  plate_number: { type: String, trim: true },
  relationship: { type: String, default: 'owner' },
  is_primary: { type: Boolean, default: true },
  status: { type: String, default: 'active' },
  user_id: { type: String, ref: 'User', required: true, index: true },
  document_status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' },
  account_status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  registered_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  reviewed_by_id: { type: String, default: null },
  reviewed_by_name: { type: String, default: null },
  reviewed_at: { type: Date, default: null },
  activity_log: { type: [activityLogSchema], default: [] },
  certificate_image_url: { type: String, trim: true, default: null },
  reject_reasons: { type: [String], default: [] },
  reject_note: { type: String, default: '' }
}, {
  collection: 'owner_vehicles',
  strict: false
});

module.exports = mongoose.model('OwnerVehicle', ownerVehicleSchema, 'owner_vehicles');