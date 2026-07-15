'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Collection: owner_vehicles
 * Owner identity and document image URLs for a registered vehicle.
 * PDPA: citizen_id is sensitive — access is permission-gated at the route level.
 */
const ownerVehicleSchema = new Schema({
  vehicle_id: { type: Number, ref: 'Vehicle', required: true, index: true },
  owner_name: { type: String, trim: true, default: null },
  owner_surname: { type: String, trim: true, default: null },
  citizen_id: {
    type: String,
    trim: true,
    default: null,
    validate: {
      validator: function (v) {
        return !v || /^\d{13}$/.test(v);
      },
      message: 'citizen_id must be exactly 13 digits'
    }
  },
  vehicle_image_url: { type: String, trim: true, default: null },
  certificate_image_url: { type: String, trim: true, default: null }
}, {
  collection: 'owner_vehicles'
});

module.exports = mongoose.model('OwnerVehicle', ownerVehicleSchema, 'owner_vehicles');
