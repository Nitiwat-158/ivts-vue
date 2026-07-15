'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Sub-document: vehicle_info
 */
const vehicleInfoSchema = new Schema({
  license_plate: { type: String, trim: true, default: null },
  province_license: { type: String, trim: true, default: null },
  brand: { type: String, trim: true, default: null },
  model: { type: String, trim: true, default: null },
  color: { type: String, trim: true, default: null },
  vehicle_type: {
    type: String,
    enum: ['car', 'motorcycle'],
    default: 'car'
  },
  priority_order: {
    type: String,
    enum: ['first_car', 'subsequent_car'],
    default: 'first_car'
  }
}, { _id: false });

/**
 * Sub-document: owner_info
 */
const ownerInfoSchema = new Schema({
  name: { type: String, trim: true, default: null },
  surname: { type: String, trim: true, default: null },
  citizen_id: { type: String, trim: true, default: null },   // 13 digits, PDPA-sensitive
  is_owner_match_user: { type: Boolean, default: false }
}, { _id: false });

/**
 * Sub-document: uploaded_documents
 * Stores URLs only — actual binary files are managed by the file storage service.
 */
const uploadedDocumentsSchema = new Schema({
  registration_book_url: { type: String, trim: true, default: null },
  vehicle_photo_url: { type: String, trim: true, default: null },
  citizen_card_url: { type: String, trim: true, default: null }
}, { _id: false });

/**
 * Sub-document: validity
 * Populated by the review/approval process — not set on submission.
 */
const validitySchema = new Schema({
  duration_years: { type: Number, default: 1 },
  start_date: { type: Date, default: null },    // set on approval
  expiry_date: { type: Date, default: null }    // start_date + 1 year, set on approval
}, { _id: false });

/**
 * Collection: requests
 * Vehicle registration and 1-year renewal workflow documents.
 * No payment tracking at this stage.
 */
const requestSchema = new Schema({
  _id: { type: String },   // e.g. "req_2026_00001" — set manually or via default
  user_id: { type: String, ref: 'User', required: true, index: true },
  request_type: {
    type: String,
    enum: ['register', 'renew'],
    required: true,
    index: true
  },
  request_status: {
    type: String,
    enum: ['pending_review', 'approved', 'rejected', 'expired'],
    default: 'pending_review',
    index: true
  },
  user_type: {
    type: String,
    enum: ['student', 'staff', 'outsider'],
    required: true
  },
  vehicle_info: { type: vehicleInfoSchema, default: () => ({}) },
  owner_info: { type: ownerInfoSchema, default: () => ({}) },
  uploaded_documents: { type: uploadedDocumentsSchema, default: () => ({}) },
  validity: { type: validitySchema, default: () => ({ duration_years: 1 }) },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  _id: false,
  collection: 'requests'
});

requestSchema.index({ user_id: 1, request_status: 1 });
requestSchema.index({ created_at: -1 });

module.exports = mongoose.model('Request', requestSchema, 'requests');
