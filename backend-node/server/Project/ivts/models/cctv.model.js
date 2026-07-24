'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Sub-document: stream_urls
 * Populated at runtime by the CCTV service from mediamtx_path.
 * Stored in DB as-is for reference; dynamic generation happens in service.
 */
const streamUrlsSchema = new Schema({
  webrtc: { type: String, trim: true, default: null },  // WebSocket for frontend real-time
  hls: { type: String, trim: true, default: null },     // HTTP M3U8 for browser compat
  rtsp_out: { type: String, trim: true, default: null } // MediaMTX RTSP for AI/image engines
}, { _id: false });

/**
 * Sub-document: location
 */
const locationSchema = new Schema({
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  description: { type: String, trim: true, default: null }
}, { _id: false });

/**
 * Collection: cctvs
 * MediaMTX-integrated cameras. source_rtsp_url is the physical camera address.
 * mediamtx_path is the stream identifier on the MediaMTX server.
 */
const cctvSchema = new Schema({
  camera_name: { type: String, trim: true, required: true, index: true },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true
  },
  source_rtsp_url: { type: String, trim: true, default: null },  // physical camera RTSP
  mediamtx_path: { type: String, trim: true, required: true, unique: true }, // e.g. "main-gate-in"
  
  // TODO(Backend): Add `camera_type` field.
  // The mobile app requires this field to determine trip status (e.g. 'gateIn', 'gateOut', 'internal').
  // camera_type: { type: String, enum: ['gateIn', 'gateOut', 'internal'] },

  stream_urls: { type: streamUrlsSchema, default: () => ({}) },
  location: { type: locationSchema, default: () => ({}) }
}, {
  collection: 'cctvs'
});

module.exports = mongoose.model('Cctv', cctvSchema, 'cctvs');
