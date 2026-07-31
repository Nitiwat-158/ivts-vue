'use strict';

/**
 * Router: mobile
 * Public, read-only API surface for the Flutter `user-mobile-application`.
 * Mounted at /api/v1/mobile (see backend-node/server/routes/app.routes.js).
 *
 * IMPORTANT (documented assumption, not a guess — see
 * docs/tasks/2026-07-24-mobile-mongodb-api.md, Blocker column):
 * The mobile app does not yet have a login/IAM session, so this router does
 * NOT apply `account.onCheckAuthorization` like ivts.routes.js does. Callers
 * must pass user_id / vehicle_id explicitly via query params. This is a
 * temporary, minimal-exposure decision (read-only, no PDPA-sensitive fields
 * such as citizen_id are returned) until real mobile authentication exists.
 */

const express = require('express');
const router = express.Router();

const mobileService = require('./service/mobile');
const iamAdminClient = require('../security/service/iam-admin-client');

function ok(response, data, status) {
  return response.status(status || 200).json({
    code: 20000,
    message: 'Success',
    data: data
  });
}

function fail(response, error) {
  const status = error && error.status ? error.status : 500;
  return response.status(status).json({
    code: status === 400 ? 40000 : status === 404 ? 40400 : 50000,
    message: error && error.message ? error.message : 'Mobile request failed'
  });
}

/**
 * GET /api/v1/mobile/vehicles?user_id=&q=
 * List vehicles mapped to the mobile app's Vehicle model shape.
 */
router.get('/vehicles', async function (request, response) {
  try {
    return ok(response, await mobileService.listVehicles(request.query || {}));
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * GET /api/v1/mobile/vehicles/:id
 */
router.get('/vehicles/:id', async function (request, response) {
  try {
    return ok(response, await mobileService.getVehicleById(request.params.id));
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * GET /api/v1/mobile/tracking/history?user_id=&vehicle_id=
 * List trip history entries mapped to the mobile app's TripHistory model shape.
 */
router.get('/tracking/history', async function (request, response) {
  try {
    return ok(response, await mobileService.listTripHistory(request.query || {}));
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * GET /api/v1/mobile/requests?user_id=
 * List request history entries mapped to the mobile app's RequestHistoryItem shape.
 */
router.get('/requests', async function (request, response) {
  try {
    return ok(response, await mobileService.listRequestHistory(request.query || {}));
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * POST /api/v1/mobile/requests
 * Create a vehicle request from mobile client payload.
 */
router.post('/requests', async function (request, response) {
  try {
    return ok(response, await mobileService.createRequest(request.body || {}), 201);
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * GET /api/v1/mobile/emergency-reports?vehicle_id=
 */
router.get('/emergency-reports', async function (request, response) {
  try {
    return ok(response, await mobileService.listEmergencyReports(request.query || {}));
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * POST /api/v1/mobile/emergency-reports
 * Create emergency report from mobile client payload.
 */
router.post('/emergency-reports', async function (request, response) {
  try {
    return ok(response, await mobileService.createEmergencyReport(request.body || {}), 201);
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * GET /api/v1/mobile/emergency-reports/:id
 * Includes a derived `timeline` array (see service/mobile.js buildEmergencyTimeline).
 */
router.get('/emergency-reports/:id', async function (request, response) {
  try {
    return ok(response, await mobileService.getEmergencyReportById(request.params.id));
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * GET /api/v1/mobile/notifications?user_id=&vehicle_id=
 * Derived from vehicles nearing/past expiry and emergency_report documents
 * (no dedicated notifications collection exists — see service/mobile.js).
 */
router.get('/notifications', async function (request, response) {
  try {
    return ok(response, await mobileService.listNotifications(request.query || {}));
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * POST /api/v1/mobile/auth/signin
 * Proxy login directly to IAM server using web approach
 */
router.post('/auth/signin', function (request, response) {
  // TODO: Before production, decide if this mobile app should only allow 'user' (car owner) role.
  // This is a temporary, minimal-exposure decision until real mobile authentication exists.
  // Extended to support both Admin and User fallback in this phase.
  request.isMobileClient = true;
  return iamAdminClient.forwardScopedSignin(request, response);
});

module.exports = router;
