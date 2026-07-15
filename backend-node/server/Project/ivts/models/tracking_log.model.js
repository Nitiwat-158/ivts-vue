'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Collection: tracking_logs
 * Raw detection events from the AI/CCTV tracking engine.
 * media_url is a snapshot image of the detected license plate.
 */
const trackingLogSchema = new Schema({
  vehicle_id: { type: Number, ref: 'Vehicle', required: true, index: true },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  media_url: { type: String, trim: true, default: null },  // snapshot image of plate
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  collection: 'tracking_logs'
});

trackingLogSchema.index({ vehicle_id: 1, timestamp: -1 });

module.exports = mongoose.model('TrackingLog', trackingLogSchema, 'tracking_logs');
