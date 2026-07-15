'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Collection: User
 * Holds local profile data linked to the MFU IAM identity.
 * IMPORTANT: No passwords are stored here. Credentials are owned by IAM.
 */
const userSchema = new Schema({
  _id: { type: String, required: true },          // e.g., "usr_mfu_001"
  iam_user_id: { type: String, required: true, unique: true, index: true }, // matches IAM token `sub`
  email: { type: String, trim: true, lowercase: true, default: null },
  name: { type: String, trim: true, default: null },
  surname: { type: String, trim: true, default: null },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
    index: true
  },
  created_at: { type: Date, default: Date.now }
}, {
  _id: false,     // We manage _id manually (string format)
  collection: 'User'
});

module.exports = mongoose.model('User', userSchema, 'User');
