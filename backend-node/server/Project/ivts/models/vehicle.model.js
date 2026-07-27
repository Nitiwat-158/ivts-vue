'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Collection: vehicles
 *
 * Schema aligned with ACTUAL live MongoDB collection (verified 2026-07-27 via Compass):
 *   _id            : String  e.g. "CR0001" — managed manually
 *   plate_number   : String  e.g. "สน 1669"
 *   vehicle_code   : String  e.g. "CR0001"  (same as _id)
 *   type           : String  "car" | "motorcycle"
 *   brand          : String
 *   model          : String
 *   color          : String
 *   province_license : String
 *   owner_name     : String
 *   validity_start : Date
 *   validity_expiry: Date
 *   last_location  : String  (CCTV zone label e.g. "E2")
 *   updated_at     : Date
 *   created_at     : Date
 *   user_id        : String
 *
 * OLD schema used `license_plate` — kept as alias index for backward compat.
 */
const vehicleSchema = new Schema({
  _id: { type: String },
  plate_number: { type: String, trim: true, default: null, index: true },
  vehicle_code: { type: String, trim: true, default: null },
  type: { type: String, trim: true, default: null },
  brand: { type: String, trim: true, default: null },
  model: { type: String, trim: true, default: null },
  color: { type: String, trim: true, default: null },
  province_license: { type: String, trim: true, default: null },
  owner_name: { type: String, trim: true, default: null },
  validity_start: { type: Date, default: null },
  validity_expiry: { type: Date, default: null },
  last_location: { type: String, trim: true, default: null },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  user_id: { type: String, ref: 'User', default: null, index: true }
}, {
  _id: false,
  collection: 'vehicles',
  strict: false
});

vehicleSchema.index({ plate_number: 1, province_license: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema, 'vehicles');
