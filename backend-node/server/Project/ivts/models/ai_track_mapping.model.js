"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Collection: ai_track_mappings
 * Maps IVTS vehicle _id (string) to ai-track global_id (number).
 * This collection is optional and empty by default; operators can seed
 * mappings for vehicles that have been reconciled with ai-track identities.
 */
const aiTrackMappingSchema = new Schema({
  vehicle_id: { type: String, required: true, index: true },
  global_id: { type: Number, required: true, index: true },
  created_at: { type: Date, default: Date.now }
}, { collection: 'ai_track_mappings', strict: false });

module.exports = mongoose.model('AiTrackMapping', aiTrackMappingSchema, 'ai_track_mappings');
