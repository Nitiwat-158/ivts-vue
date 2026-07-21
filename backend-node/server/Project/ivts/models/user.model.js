'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Collection: users
 * Holds local profile data linked to the MFU IAM identity.
 * IMPORTANT: No passwords are stored here. Credentials are owned by IAM.
 */
const userSchema = new Schema({
  _id: { type: String, required: true }, 
  iam_user_id: { type: String, required: true, unique: true, index: true }, 
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
  _id: false,
  collection: 'users',
  timestamps: false, 
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true }
});

// เพิ่ม Virtual field สำหรับ Full Name เพื่อให้ Frontend ดึงไปใช้ง่ายขึ้น
userSchema.virtual('fullName').get(function() {
  return `${this.name || ''} ${this.surname || ''}`.trim();
});

module.exports = mongoose.model('users', userSchema, 'users');