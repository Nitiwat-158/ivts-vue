'use strict';

/**
 * iam-mobile-client.js
 *
 * Dedicated IAM client for User Mobile Application authentication.
 * Handles login via MFU IAM and JIT-provisions the user into the local
 * MongoDB `users` collection. This module is intentionally separate from
 * iam-admin-client.js — Web Admin login and Mobile User login have distinct
 * flows, scope requirements, and error handling.
 *
 * Routes using this module: /api/v1/mobile/auth/signin (mobile.routes.js)
 */

const axios = require('axios');
const mongoose = require('mongoose');
const config = require('../../../../config/config');
const UserModel = require('../../ivts/models/user.model');

const USER_API_BASE_PATH = '/api/v1';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeError(err, fallbackError) {
  const statusCode = err.statusCode || (err.response && err.response.status) || 502;
  const payload = err.payload
    ? err.payload
    : err.response && err.response.data
      ? err.response.data
      : { status: false, error: err.message || fallbackError };
  return { statusCode, payload };
}

function relaySetCookie(response, result) {
  const headers = result && result.headers ? result.headers : {};
  const cookies = headers['set-cookie'] || headers['Set-Cookie'];
  if (cookies && response && typeof response.setHeader === 'function') {
    response.setHeader('Set-Cookie', cookies);
  }
}

/**
 * Build the HTTP options object for a request forwarded from the mobile client
 * to the MFU IAM server (user-facing endpoint, not admin B2B endpoint).
 */
function createMobileRequestOptions(request, options) {
  const requestHeaders = request && request.headers ? request.headers : {};
  return {
    method: options.method,
    path: options.path,
    params: options.params || request.query || {},
    data: options.data || request.body || {},
    headers: {
      lang: requestHeaders.lang || 'th',
      'x-access-token': requestHeaders['x-access-token'] || '',
      'user-agent': requestHeaders['user-agent'] || '',
      'x-forwarded-for': requestHeaders['x-forwarded-for'] || request.ip || '',
      cookie: requestHeaders.cookie || '',
      'x-client-id': config.iam && config.iam.clientId
        ? config.iam.clientId
        : (config.iamAdmin && config.iamAdmin.clientId ? config.iamAdmin.clientId : ''),
      'x-audience': config.iam && config.iam.requiredAudience ? config.iam.requiredAudience : '',
      'x-system': config.project && config.project.code ? String(config.project.code) : 'ivts'
    }
  };
}

function createMobileRequestOptionsWithToken(request, options, accessToken) {
  const opts = createMobileRequestOptions(request, options);
  opts.headers['x-access-token'] = accessToken ? String(accessToken) : '';
  return opts;
}

/**
 * Make an HTTP request to the MFU IAM user-facing API.
 */
async function requestIAMUser(options) {
  const iamBaseUrl = config.iam && config.iam.baseUrl;
  if (!iamBaseUrl) {
    const error = new Error('iam_not_configured');
    error.statusCode = 503;
    error.payload = { status: false, error: 'iam_not_configured' };
    throw error;
  }
  const response = await axios.request({
    baseURL: iamBaseUrl,
    url: `${USER_API_BASE_PATH}${options.path}`,
    method: options.method,
    headers: Object.assign({}, options.headers || {}),
    params: options.params || undefined,
    data: options.data || undefined,
    timeout: 15000
  });
  return {
    statusCode: response.status,
    payload: response.data || {},
    headers: response.headers || {}
  };
}

/**
 * Resolve the IAM account details for the given access token.
 */
async function resolveIAMAccountWithToken(request, accessToken) {
  const result = await requestIAMUser(createMobileRequestOptionsWithToken(request, {
    method: 'get',
    path: '/auth/me',
    params: {},
    data: {}
  }, accessToken));
  const payload = result && result.payload ? result.payload : {};
  const data = payload && payload.data ? payload.data : null;
  return {
    statusCode: result.statusCode,
    payload: payload,
    account: data
  };
}

/**
 * Best-effort revoke session on the IAM server.
 */
async function revokeIAMSession(request, accessToken) {
  if (!accessToken) return;
  try {
    await requestIAMUser(createMobileRequestOptionsWithToken(request, {
      method: 'post',
      path: '/auth/logout',
      params: {},
      data: {}
    }, accessToken));
  } catch (err) {
    // Best effort — original error is more important.
  }
}

// ---------------------------------------------------------------------------
// JIT User Provisioning (MongoDB users collection)
// ---------------------------------------------------------------------------

/**
 * Lookup or create a local user record from an IAM account object.
 * Performs security check to prevent account hijacking.
 * Returns { user, hijackDetected }.
 */
async function jitProvisionFromIAMAccount(iamAccount, request, accessToken) {
  const iamUserId = iamAccount && iamAccount._id ? String(iamAccount._id) : '';
  const email = iamAccount && iamAccount.email ? String(iamAccount.email) : '';

  if (!iamUserId || !email) {
    return { user: null, hijackDetected: false };
  }

  const firstName = iamAccount.userinfo && iamAccount.userinfo.firstName
    ? String(iamAccount.userinfo.firstName)
    : '';
  const lastName = iamAccount.userinfo && iamAccount.userinfo.lastName
    ? String(iamAccount.userinfo.lastName)
    : '';
  const pictureUrl = iamAccount.userinfo && iamAccount.userinfo.picture
    ? String(iamAccount.userinfo.picture)
    : '';

  let user = await UserModel.findOne({
    $or: [
      { iam_user_id: iamUserId },
      { email: email }
    ]
  });

  if (!user) {
    // JIT create
    user = new UserModel({
      _id: new mongoose.Types.ObjectId().toString(),
      iam_user_id: iamUserId,
      email: email,
      name: firstName,
      surname: lastName,
      avatar_url: pictureUrl,
      role: 'user'
    });
    await user.save();
    return { user: user, hijackDetected: false };
  }

  // Security: detect iam_user_id mismatch (email already taken by a different IAM account)
  if (user.iam_user_id && user.iam_user_id !== iamUserId) {
    return { user: null, hijackDetected: true };
  }

  // JIT update stale profile fields
  let needsUpdate = false;
  if (user.name !== firstName || user.surname !== lastName || user.email !== email || user.avatar_url !== pictureUrl) {
    user.name = firstName;
    user.surname = lastName;
    user.email = email;
    user.avatar_url = pictureUrl;
    needsUpdate = true;
  }
  if (!user.iam_user_id) {
    user.iam_user_id = iamUserId;
    needsUpdate = true;
  }
  if (needsUpdate) {
    await user.save();
  }

  return { user: user, hijackDetected: false };
}

/**
 * Lookup or create a local user record from a verified Google ID Token payload.
 * Returns { user, hijackDetected }.
 */
async function jitProvisionFromGoogleToken(decoded) {
  const gIamId = 'google-' + (decoded.sub || decoded.email);
  const email = decoded.email ? String(decoded.email).trim().toLowerCase() : '';
  const gName = decoded.given_name ? String(decoded.given_name) : '';
  const gSurname = decoded.family_name ? String(decoded.family_name) : '';
  const gPicture = decoded.picture ? String(decoded.picture) : '';

  if (!email) {
    return { user: null, hijackDetected: false };
  }

  let user = await UserModel.findOne({ email: email });

  if (!user) {
    user = new UserModel({
      _id: new mongoose.Types.ObjectId().toString(),
      iam_user_id: gIamId,
      email: email,
      name: gName,
      surname: gSurname,
      avatar_url: gPicture,
      role: 'user'
    });
    await user.save();
    return { user: user, hijackDetected: false };
  }

  // Security: iam_user_id mismatch
  if (user.iam_user_id && user.iam_user_id !== gIamId) {
    return { user: null, hijackDetected: true };
  }

  let needsUpdate = false;
  if (user.name !== gName || user.surname !== gSurname || user.avatar_url !== gPicture) {
    user.name = gName;
    user.surname = gSurname;
    user.avatar_url = gPicture;
    needsUpdate = true;
  }
  if (!user.iam_user_id) {
    user.iam_user_id = gIamId;
    needsUpdate = true;
  }
  if (needsUpdate) {
    await user.save();
  }

  return { user: user, hijackDetected: false };
}

// ---------------------------------------------------------------------------
// Mobile signin response builder
// ---------------------------------------------------------------------------

function buildMobileUserResponse(user, signinResult) {
  const payload = signinResult && signinResult.payload ? signinResult.payload : {};
  return Object.assign({}, payload, {
    status: true,
    data: Object.assign({}, payload.data || {}, {
      role: user.role || 'user',
      account: {
        _id: user.id || user._id,
        email: user.email,
        firstname: user.name,
        lastname: user.surname,
        avatar_url: user.avatar_url,
        role: user.role || 'user'
      }
    })
  });
}

// ---------------------------------------------------------------------------
// Public: forwardMobileSignin
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/mobile/auth/signin
 *
 * Authentication flow for the user-mobile-application via MFU IAM:
 *
 * 1. Forward credentials to MFU IAM `/signin`.
 * 2a. If IAM returns a valid xAccessToken → resolve account via `/auth/me`
 *     → JIT provision in MongoDB `users` collection → respond with user payload.
 * 2b. If IAM does NOT return a token (e.g. IAM unreachable / no MFU IAM account)
 *     AND the request includes a Google ID Token (`body.token`) → verify the
 *     Google token → JIT provision user from Google claims → respond with a
 *     dev-bypass token. This branch is intended for development / testing
 *     only; disable before production release.
 * 3. On any hijack-detection, the session is revoked and a 403 is returned.
 *
 * Mobile users are NEVER checked against the IVTS admin scope.
 * They are always assigned `role: 'user'`.
 */
async function forwardMobileSignin(request, response) {
  try {
    // --- Step 1: Try MFU IAM signin ----------------------------------------
    let signinResult;
    let iamError = null;

    try {
      signinResult = await requestIAMUser(createMobileRequestOptions(request, {
        method: 'post',
        path: '/signin'
      }));
    } catch (reqErr) {
      iamError = reqErr;
      signinResult = {
        statusCode: reqErr.response ? reqErr.response.status : 500,
        payload: reqErr.response && reqErr.response.data
          ? reqErr.response.data
          : { status: false, error: reqErr.message },
        headers: {}
      };
    }

    const payload = signinResult && signinResult.payload ? signinResult.payload : {};
    const accessToken = payload && payload.data && payload.data.xAccessToken
      ? String(payload.data.xAccessToken)
      : '';

    // --- Step 2a: IAM returned a valid token ---------------------------------
    if (accessToken) {
      const current = await resolveIAMAccountWithToken(request, accessToken);
      const iamAccount = current && current.account ? current.account : null;

      const { user, hijackDetected } = await jitProvisionFromIAMAccount(iamAccount, request, accessToken);

      if (hijackDetected) {
        await revokeIAMSession(request, accessToken);
        return response.status(403).json({
          status: false,
          error: 'account_conflict_hijack_attempt'
        });
      }

      if (user) {
        const mobilePayload = buildMobileUserResponse(user, signinResult);
        relaySetCookie(response, signinResult);
        return response.status(signinResult.statusCode || 200).json(mobilePayload);
      }

      // Unexpected: IAM returned a token but we could not resolve a user profile
      await revokeIAMSession(request, accessToken);
      return response.status(403).json({
        status: false,
        error: 'mobile_user_not_resolvable'
      });
    }

    // --- Step 2b: IAM did not return a token — try Google ID Token bypass ----
    if (request.body && request.body.token) {
      try {
        const { OAuth2Client } = require('google-auth-library');
        const audience = config.google && config.google.clientId
          ? config.google.clientId
          : '298470872970-am1echombj03p2n223p9gavitmo811kq.apps.googleusercontent.com';
        const client = new OAuth2Client(audience);
        const ticket = await client.verifyIdToken({ idToken: request.body.token, audience });
        const decoded = ticket.getPayload();

        if (decoded && decoded.email) {
          const { user, hijackDetected } = await jitProvisionFromGoogleToken(decoded);

          if (hijackDetected) {
            return response.status(403).json({
              status: false,
              error: 'account_conflict_hijack_attempt'
            });
          }

          if (user) {
            return response.status(200).json({
              status: true,
              data: {
                xAccessToken: 'google-bypass-token-' + decoded.email,
                role: user.role || 'user',
                require2FA: false,
                account: {
                  _id: user.id || user._id,
                  email: user.email,
                  firstname: user.name,
                  lastname: user.surname,
                  avatar_url: user.avatar_url,
                  role: user.role || 'user'
                }
              }
            });
          }
        }
      } catch (googleErr) {
        // Google token invalid — fall through to IAM error response
      }
    }

    // --- Step 3: No token, no Google bypass — relay IAM response -------------
    relaySetCookie(response, signinResult);
    return response.status(signinResult.statusCode || 401).json(payload);

  } catch (err) {
    const normalized = normalizeError(err, 'mobile_iam_signin_failed');
    return response.status(normalized.statusCode).json(normalized.payload);
  }
}

module.exports = {
  forwardMobileSignin,
  // Exposed for testing only:
  jitProvisionFromIAMAccount,
  jitProvisionFromGoogleToken,
  requestIAMUser
};
