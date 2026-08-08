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
const iamMobileClient = require('../security/service/iam-mobile-client');
const aiTrackAdapter = require('../../services/aiTrackAdapter');
const { Pool } = require('pg');
const pathLib = require('path');

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

let aiTrackPool = null;
try {
  const aiTrackConnectionString = process.env.AI_TRACK_DATABASE_URL || process.env.AI_TRACK_DATABASE_URL_STRING;
  const poolConfig = aiTrackConnectionString
    ? { connectionString: aiTrackConnectionString }
    : {
        user: process.env.AI_TRACK_DB_USER || process.env.DB_USER || 'postgres',
        host: process.env.AI_TRACK_DB_HOST || process.env.DB_HOST || 'localhost',
        database: process.env.AI_TRACK_DB_NAME || process.env.DB_NAME || 'mfu_vehicle_track',
        password: process.env.AI_TRACK_DB_PASSWORD || process.env.DB_PASSWORD || '',
        port: process.env.AI_TRACK_DB_PORT || process.env.DB_PORT || 5432,
      };
  aiTrackPool = new Pool(poolConfig);
} catch (err) {
  console.warn('ai-track mobile: pg Pool not created:', err && err.message ? err.message : err);
}

function aiTrackCameraYamlPath() {
  return aiTrackAdapter.resolveAiTrackPath('config/cameras.yaml');
}

function aiTrackRouteSegmentsYamlPath() {
  return aiTrackAdapter.resolveAiTrackPath('config/route_segments.yaml');
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
 * GET /api/v1/mobile/ai-track/cameras
 * Public mobile read-only access to AI Track camera metadata.
 */
router.get('/ai-track/cameras', async function (request, response) {
  try {
    const camMap = aiTrackAdapter.loadCamerasFromYaml(aiTrackCameraYamlPath());
    const result = Object.fromEntries(
      Object.values(camMap).map((c) => [
        c.id,
        {
          lat: c.lat,
          lng: c.lng,
          location_name: c.location_name,
        },
      ])
    );
    return ok(response, result);
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * GET /api/v1/mobile/ai-track/vehicles/recent
 */
router.get('/ai-track/vehicles/recent', async function (request, response) {
  try {
    if (!aiTrackPool) {
      const error = new Error('ai-track database pool unavailable');
      error.status = 500;
      throw error;
    }
    const limit = parseInt(request.query.limit || '50', 10);
    const rows = await aiTrackAdapter.getRecentVehicles(aiTrackPool, limit);
    return ok(response, { count: rows.length, vehicles: rows });
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * GET /api/v1/mobile/ai-track/vehicles/full-route
 */
router.get('/ai-track/vehicles/full-route', async function (request, response) {
  try {
    if (!aiTrackPool) {
      const error = new Error('ai-track database pool unavailable');
      error.status = 500;
      throw error;
    }
    const cameras = request.query.cameras ? String(request.query.cameras).split(',').map((s) => s.trim()) : null;
    const rows = await aiTrackAdapter.getVehiclesVisitingAllCameras(aiTrackPool, cameras);
    const vehicles = rows.map((r) => ({
      global_id: r.global_id,
      cameras_visited: r.cameras_visited,
      first_seen: r.first_seen,
      last_seen: r.last_seen,
    }));
    return ok(response, { required_cameras: cameras, count: vehicles.length, vehicles });
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * GET /api/v1/mobile/ai-track/vehicle/:global_id/timeline
 */
router.get('/ai-track/vehicle/:global_id/timeline', async function (request, response) {
  try {
    if (!aiTrackPool) {
      const error = new Error('ai-track database pool unavailable');
      error.status = 500;
      throw error;
    }
    const globalId = parseInt(request.params.global_id, 10);
    if (Number.isNaN(globalId)) {
      const error = new Error('invalid global_id');
      error.status = 400;
      throw error;
    }
    const rows = await aiTrackAdapter.getVehicleTimeline(aiTrackPool, globalId);
    if (!rows || rows.length === 0) {
      const error = new Error('not found');
      error.status = 404;
      throw error;
    }
    const camMap = aiTrackAdapter.loadCamerasFromYaml(aiTrackCameraYamlPath());
    const routeSegments = aiTrackAdapter.loadRouteSegmentsFromYaml(aiTrackRouteSegmentsYamlPath());
    const formattedTimeline = aiTrackAdapter.formatTimeline(rows, camMap);
    const route = aiTrackAdapter.buildRoutePolyline(formattedTimeline, routeSegments);
    return ok(response, { global_id: globalId, total_records: formattedTimeline.length, timeline: formattedTimeline, route });
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * POST /api/v1/mobile/auth/register
 * Mobile-specific local user registration.
 * Handled by iam-mobile-client.js
 */
router.post('/auth/register', function (request, response) {
  return iamMobileClient.registerLocalUser(request, response);
});

/**
 * POST /api/v1/mobile/auth/signin
 * Mobile-specific login via local MongoDB users or MFU IAM.
 * Handled by iam-mobile-client.js which:
 *  - Checks local user password hash first
 *  - Proxies credentials to MFU IAM /signin if not local
 *  - JIT-provisions the user in the local MongoDB `users` collection
 *  - Falls back to Google ID Token verification when IAM is unavailable
 * Mobile users are always assigned role: 'user'.
 * Web Admin login is handled separately by iam-admin-client.js via accounts.routes.js.
 */
router.post('/auth/signin', function (request, response) {
  return iamMobileClient.forwardMobileSignin(request, response);
});

module.exports = router;
