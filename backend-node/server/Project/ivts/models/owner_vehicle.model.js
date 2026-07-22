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
  vehicle_id: { type: String, ref: 'Vehicle', required: true, index: true },
  user_id: { type: String, ref: 'User', required: true, index: true },
  document_status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  account_status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  registered_at: { type: Date, default: Date.now },
  reviewed_by_id: { type: String, default: null },
  reviewed_by_name: { type: String, default: null },
  reviewed_at: { type: Date, default: null },
  activity_log: { type: [activityLogSchema], default: [] },
  certificate_image_url: { type: String, trim: true, default: null } // Optional, for UI rendering if needed
}, {
  collection: 'owner_vehicles'
});

module.exports = mongoose.model('OwnerVehicle', ownerVehicleSchema, 'owner_vehicles');