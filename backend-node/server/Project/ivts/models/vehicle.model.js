'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Import the auto-increment sequence plugin to handle sequential numeric IDs
const AutoIncrement = require('mongoose-sequence')(mongoose);

/**
 * Collection: vehicles
 * Registered vehicles linked to a user. The `cctv_id` records where
 * the vehicle was last detected by the tracking engine.
 */
const vehicleSchema = new Schema({
  user_id: { type: String, ref: 'User', required: true, index: true },
  license_plate: { type: String, trim: true, required: true, index: true },   // e.g., "สน 1669"
  province_license: { type: String, trim: true, default: null },
  brand: { type: String, trim: true, default: null },
  model: { type: String, trim: true, default: null },
  color: { type: String, trim: true, default: null },
  cctv_id: { type: Number, ref: 'Cctv', default: null, index: true }  // Last detected CCTV camera ID
  // Note: The numeric ID field (vehicle_numeric_id) is omitted here 
  // as it will be dynamically injected and managed by the AutoIncrement plugin.
}, {
  collection: 'vehicles'
});

// Compound index to optimize queries looking up vehicles by plate and province
vehicleSchema.index({ license_plate: 1, province_license: 1 });

// Configure the plugin to automatically increment 'vehicle_numeric_id' by 1 for every new record
vehicleSchema.plugin(AutoIncrement, { inc_field: 'vehicle_numeric_id' });

module.exports = mongoose.model('Vehicle', vehicleSchema, 'vehicles');