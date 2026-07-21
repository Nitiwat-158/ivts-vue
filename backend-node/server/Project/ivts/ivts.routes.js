'use strict';

const express = require('express');
const router = express.Router();

const account = require('../accounts/service/account');
const authorization = require('../security/service/authorization');

// Existing document service
const ivtsDocument = require('./service/ivts_document');

// New IVTS domain services
const vehicleRequest = require('./service/vehicle_request');
const cctvService = require('./service/cctv');
const vehicleService = require('./service/vehicle');
const trackingService = require('./service/tracking');

// ─── Permission guards ────────────────────────────────────────────────────────

// Existing registry guards
const canViewRegistry = authorization.requirePermission('/ivts/registry', 'view');
const canEditRegistry = authorization.requirePermission('/ivts/registry', 'edit');
const canDeleteRegistry = authorization.requirePermission('/ivts/registry', 'delete');
const canViewReports = authorization.requirePermission(['/ivts/registry', '/ivts/reports'], 'view');

// Vehicle request guards
const canViewRequests = authorization.requirePermission('/ivts/requests', 'view');
const canSubmitRequest = authorization.requirePermission('/ivts/requests', 'edit');
const canReviewRequest = authorization.requirePermission('/ivts/requests', 'action');

// Vehicle guards
const canViewVehicles = authorization.requirePermission('/ivts/vehicles', 'view');

// CCTV guards
const canViewCctvs = authorization.requirePermission('/ivts/cctvs', 'view');

// Tracking guards
const canViewTracking = authorization.requirePermission('/ivts/tracking', 'view');

// ─── Response helpers (project-standard envelope) ─────────────────────────────

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
    code: status === 400 ? 40000 : 50000,
    message: error && error.message ? error.message : 'IVTS request failed'
  });
}

// ─── Auth guard (applies to ALL routes below) ─────────────────────────────────

router.use(account.onCheckAuthorization);

// ═════════════════════════════════════════════════════════════════════════════
// EXISTING: IVTS Document routes  (unchanged)
// ═════════════════════════════════════════════════════════════════════════════

router.get('/documents', canViewRegistry, async function (request, response) {
  try {
    return ok(response, await ivtsDocument.list(request.query || {}));
  } catch (error) {
    return fail(response, error);
  }
});

router.get('/documents/stats', canViewReports, async function (request, response) {
  try {
    return ok(response, await ivtsDocument.stats());
  } catch (error) {
    return fail(response, error);
  }
});

router.post('/documents', canEditRegistry, async function (request, response) {
  try {
    return ok(response, await ivtsDocument.create(request.body || {}, request), 201);
  } catch (error) {
    return fail(response, error);
  }
});

router.put('/documents/:id', canEditRegistry, async function (request, response) {
  try {
    return ok(response, await ivtsDocument.update(request.params.id, request.body || {}, request));
  } catch (error) {
    return fail(response, error);
  }
});

router.delete('/documents/:id', canDeleteRegistry, async function (request, response) {
  try {
    return ok(response, await ivtsDocument.remove(request.params.id));
  } catch (error) {
    return fail(response, error);
  }
});

router.post('/documents/seed-demo', canEditRegistry, async function (request, response) {
  try {
    return ok(response, await ivtsDocument.seedDemo(request), 201);
  } catch (error) {
    return fail(response, error);
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// NEW: Vehicle Registration Requests  (POST /requests/submit, GET /requests, etc.)
// Mount: /api/v1/ivts/requests/*
// ═════════════════════════════════════════════════════════════════════════════

// Import User Service (ไฟล์ service/user.js ที่มีฟังก์ชั่น list)
const userService = require('./service/users');
// Permission guard สำหรับ User Management
const canViewUsers = authorization.requirePermission('/security/users', 'view'); // หรือตาม permission path ของคุณ

// ═════════════════════════════════════════════════════════════════════════════
// NEW: User Management (GET /users)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/v1/ivts/users  (หรือ /api/v1/users)
 * List local users from MongoDB
 */
router.get(['/users', '/account/users'], canViewUsers, async function (request, response) {
  try {
    const result = await userService.list(request.query || {});
    
    // ดึง user array จาก result.data
    const userList = result.data || result.items || [];
    const paginationInfo = result.pagination || {};

    return response.status(200).json({
      code: 20000,
      message: 'Success',
      data: userList,
      items: userList,
      rows: userList,
      users: userList,
      pagination: paginationInfo
    });
  } catch (error) {
    return fail(response, error);
  }
});


/**
 * GET /api/v1/ivts/requests
 * List all requests (admin view, or filtered by user_id query param for self-service).
 */
router.get('/requests', canViewRequests, async function (request, response) {
  try {
    return ok(response, await vehicleRequest.list(request.query || {}));
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * GET /api/v1/ivts/requests/:id
 * Get a single request by ID.
 */
router.get('/requests/:id', canViewRequests, async function (request, response) {
  try {
    return ok(response, await vehicleRequest.getById(request.params.id));
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * POST /api/v1/ivts/requests/submit
 * Authenticated user submits a vehicle registration or renewal application.
 * priority_order (first_car / subsequent_car) is resolved automatically.
 *
 * Body: { request_type, user_type, vehicle_info, owner_info, uploaded_documents }
 */
router.post('/requests/submit', canSubmitRequest, async function (request, response) {
  try {
    return ok(response, await vehicleRequest.submit(request.body || {}, request), 201);
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * PUT /api/v1/ivts/requests/:id/review  (admin only)
 * Approve or reject a pending request.
 * On approval: sets validity dates (+1 year) and syncs vehicles + owner_vehicles.
 *
 * Body: { request_status: 'approved' | 'rejected' | 'expired' }
 */
router.put('/requests/:id/review', canReviewRequest, async function (request, response) {
  try {
    return ok(response, await vehicleRequest.review(request.params.id, request.body || {}, request));
  } catch (error) {
    return fail(response, error);
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// NEW: Vehicles  (GET /vehicles, GET /vehicles/:id)
// Mount: /api/v1/ivts/vehicles/*
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/v1/ivts/vehicles
 * List registered vehicles. Supports ?user_id=&q= filters.
 */
router.get('/vehicles', canViewVehicles, async function (request, response) {
  try {
    return ok(response, await vehicleService.list(request.query || {}));
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * GET /api/v1/ivts/vehicles/:id
 * Get a single vehicle by ID, with owner record attached.
 */
router.get('/vehicles/:id', canViewVehicles, async function (request, response) {
  try {
    return ok(response, await vehicleService.getById(request.params.id));
  } catch (error) {
    return fail(response, error);
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// NEW: CCTVs  (GET /cctvs, GET /cctvs/:id)
// Mount: /api/v1/ivts/cctvs/*
// Dynamic stream URLs (WebRTC/HLS/RTSP) are assembled from MEDIAMTX_BASE_URL env.
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/v1/ivts/cctvs
 * List CCTV cameras. Supports ?status=active|inactive&q= filters.
 * Each camera object includes dynamically generated stream_urls.
 */
router.get('/cctvs', canViewCctvs, async function (request, response) {
  try {
    return ok(response, await cctvService.list(request.query || {}));
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * GET /api/v1/ivts/cctvs/:id
 * Get a single CCTV camera with dynamically generated stream URLs.
 * stream_urls.webrtc  — WebSocket for frontend real-time playback
 * stream_urls.hls     — HTTP M3U8 for browser compatibility
 * stream_urls.rtsp_out — RTSP for AI/image processing engines
 */
router.get('/cctvs/:id', canViewCctvs, async function (request, response) {
  try {
    return ok(response, await cctvService.getById(request.params.id));
  } catch (error) {
    return fail(response, error);
  }
});

router.get('/cctvs/:id/stream/hls', canViewCctvs, async function (request, response) {
  try {
    await cctvService.proxyHlsStream(request.params.id, request, response);
  } catch (error) {
    return fail(response, error);
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// NEW: Tracking  (GET /tracking/logs, GET /tracking/history)
// Mount: /api/v1/ivts/tracking/*
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/v1/ivts/tracking/logs
 * List raw tracking log events. Supports ?vehicle_id=&from=&to=&page=&limit= filters.
 */
router.get('/tracking/logs', canViewTracking, async function (request, response) {
  try {
    return ok(response, await trackingService.listLogs(request.query || {}));
  } catch (error) {
    return fail(response, error);
  }
});

/**
 * GET /api/v1/ivts/tracking/history
 * List user-level tracking histories. Supports ?user_id=&vehicle_id=&from=&to= filters.
 */
router.get('/tracking/history', canViewTracking, async function (request, response) {
  try {
    return ok(response, await trackingService.listHistory(request.query || {}));
  } catch (error) {
    return fail(response, error);
  }
});

module.exports = router;
