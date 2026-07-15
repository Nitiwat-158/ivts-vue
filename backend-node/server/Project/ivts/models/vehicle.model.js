'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Collection: vehicles
 * Registered vehicles linked to a user. The `cctv_id` records where
 * the vehicle was last detected by the tracking engine.
 */
const vehicleSchema = new Schema({
  user_id: { type: String, ref: 'User', required: true, index: true },
  license_plate: { type: String, trim: true, required: true, index: true },   // e.g. "สน 1669"
  province_license: { type: String, trim: true, default: null },
  brand: { type: String, trim: true, default: null },
  model: { type: String, trim: true, default: null },
  color: { type: String, trim: true, default: null },
  cctv_id: { type: Number, ref: 'Cctv', default: null, index: true }  // last detected CCTV
}, {
  collection: 'vehicles'
});

vehicleSchema.index({ license_plate: 1, province_license: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema, 'vehicles');
