'use strict';

/**
 * Bridge helper for AI-track -> IVTS Mongo tracking history writes.
 * This is intentionally small and HTTP-based: Python-side detection/saving
 * can POST a match to Node when a registered vehicle reference identifies a
 * user.
 */
const TrackingHistory = require('../models/tracking_history.model');

async function writeUserTrackingHistory({ userId, cameraId, lat, lng, timestamp, globalId, vehicleId, logId }) {
  if (!vehicleId && vehicleId !== 0) {
    const message = 'vehicle_id is required for AI-track ownership history writes; refusing to use global_id as a substitute because the two identifiers are distinct value spaces.';
    console.error(`[Ownership Bridge] ${message}`);
    const error = new Error(message);
    error.status = 400;
    throw error;
  }

  const payload = {
    user_id: String(userId),
    vehicle_id: String(vehicleId),
    log_id: Number(logId || 0),
    timestamp: timestamp || new Date(),
    camera_id: cameraId || null,
    lat: lat || null,
    lng: lng || null,
  };

  const doc = await TrackingHistory.create(payload);
  return doc;
}

module.exports = {
  writeUserTrackingHistory,
};
