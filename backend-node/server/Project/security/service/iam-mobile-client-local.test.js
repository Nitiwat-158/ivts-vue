'use strict';

/**
 * iam-mobile-client-local.test.js
 *
 * Unit tests for local registration, password hashing, and local signin
 * in iam-mobile-client.js.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const iamMobileClient = require('./iam-mobile-client');
const UserModel = require('../../ivts/models/user.model');

function createResponse() {
  return {
    statusCode: 200,
    payload: null,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    }
  };
}

test('Password hashing and verification', () => {
  const plainPassword = 'mySecretPassword123';
  const hashed = iamMobileClient.hashPassword(plainPassword);

  assert.ok(hashed.startsWith('scrypt:'), 'Hash should start with scrypt:');
  assert.equal(iamMobileClient.verifyPassword(plainPassword, hashed), true, 'Valid password should verify');
  assert.equal(iamMobileClient.verifyPassword('wrongPassword', hashed), false, 'Wrong password should fail verification');
});

test('registerLocalUser validation failure when missing required fields', async () => {
  const req = { body: { email: 'test@example.com' } };
  const res = createResponse();

  await iamMobileClient.registerLocalUser(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.status, false);
});

test('registerLocalUser success creates user with hashed password', async () => {
  const originalFindOne = UserModel.findOne;
  const originalCountDocuments = UserModel.countDocuments;
  let savedUser = null;

  UserModel.findOne = async () => null; // No duplicate
  UserModel.countDocuments = async () => 5;
  UserModel.prototype.save = async function() {
    savedUser = this;
    return this;
  };

  try {
    const req = {
      body: {
        email: 'newuser@mfu.ac.th',
        password: 'Password123!',
        name: 'สมชาย',
        surname: 'ใจดี',
        phone: '0812345678',
        user_type: 'Information Technology'
      }
    };
    const res = createResponse();

    await iamMobileClient.registerLocalUser(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.payload.status, true);
    assert.equal(res.payload.data.account.email, 'newuser@mfu.ac.th');
    assert.ok(savedUser, 'User document should be saved');
    assert.ok(savedUser.password.startsWith('scrypt:'), 'Password should be hashed with scrypt');
    assert.equal(savedUser.name, 'สมชาย');
    assert.equal(savedUser.phone, '0812345678');
    assert.equal(savedUser.user_id.startsWith('usr_local_'), true, 'user_id should be set with custom prefix');
  } finally {
    UserModel.findOne = originalFindOne;
    UserModel.countDocuments = originalCountDocuments;
  }
});

test('forwardMobileSignin succeeds for local user with correct password', async () => {
  const originalFindOne = UserModel.findOne;
  const hashedPassword = iamMobileClient.hashPassword('Secret123');

  UserModel.findOne = async () => ({
    user_id: 'usr_local_123',
    email: 'localuser@mfu.ac.th',
    password: hashedPassword,
    name: 'มานี',
    surname: 'มีใจ',
    phone: '0899999999',
    role: 'user'
  });

  try {
    const req = {
      body: {
        username: Buffer.from('localuser@mfu.ac.th').toString('base64'),
        password: Buffer.from('Secret123').toString('base64')
      }
    };
    const res = createResponse();

    await iamMobileClient.forwardMobileSignin(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.status, true);
    assert.equal(res.payload.data.account.email, 'localuser@mfu.ac.th');
    assert.equal(res.payload.data.account.firstname, 'มานี');
  } finally {
    UserModel.findOne = originalFindOne;
  }
});
