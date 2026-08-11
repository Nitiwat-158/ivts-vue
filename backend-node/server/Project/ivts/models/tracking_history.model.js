'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Collection: tracking_histories
 * User-facing audit trail linking a user to a specific vehicle detection event.
 */
const trackingHistorySchema = new Schema({
  user_id: { type: String, ref: 'User', required: true, index: true },
  vehicle_id: { type: String, ref: 'Vehicle', required: true, index: true },
  tracking_logs_id: { type: Number, ref: 'TrackingLog', required: true },
  camera_id: { type: String, default: null, index: true },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  collection: 'tracking_histories'
});

trackingHistorySchema.index({ user_id: 1, timestamp: -1 });
trackingHistorySchema.index({ vehicle_id: 1, timestamp: -1 });

module.exports = mongoose.model('TrackingHistory', trackingHistorySchema, 'tracking_histories');
