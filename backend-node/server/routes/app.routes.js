const accountRoutes = require("../Project/accounts/accounts.routes");
const ivtsRoutes = require("../Project/ivts/ivts.routes");
const mobileRoutes = require("../Project/ivts/mobile.routes");
const securityRoutes = require("../Project/security/security.routes");
const settingsRoutes = require("../Project/settings/settings.routes");

const accountService = require('../Project/accounts/service/account');
const authorization = require('../Project/security/service/authorization');

// ai-track integration
const aiTrackRoutes = require("../routes/aiTrack.routes");
const aiTrackAdapter = require('../services/aiTrackAdapter');
let aiTrackPool = null;
try {
  const { Pool } = require('pg');
  const aiTrackConnectionString = process.env.AI_TRACK_DATABASE_URL || process.env.AI_TRACK_DATABASE_URL_STRING;
  const poolConfig = aiTrackConnectionString ? {
    connectionString: aiTrackConnectionString,
  } : {
    user: process.env.AI_TRACK_DB_USER || process.env.DB_USER || 'postgres',
    host: process.env.AI_TRACK_DB_HOST || process.env.DB_HOST || 'localhost',
    database: process.env.AI_TRACK_DB_NAME || process.env.DB_NAME || 'mfu_vehicle_track',
    password: process.env.AI_TRACK_DB_PASSWORD || process.env.DB_PASSWORD || '',
    port: process.env.AI_TRACK_DB_PORT || process.env.DB_PORT || 5432,
  };
  aiTrackPool = new Pool(poolConfig);
} catch (e) {
  // pg may not be installed in dev environments; routes will still register but DB calls will fail until Pool is available.
  console.warn('ai-track: pg Pool not created:', e && e.message ? e.message : e);
}

function createAiTrackDevAuthMiddleware() {
  const bypassEnabled = String(process.env.AI_TRACK_DEV_BYPASS_AUTH || '').toLowerCase() === 'true';
  const isLocalDev = String(process.env.NODE_ENV || '').toLowerCase() === 'development' || String(process.env.PROJECT_ENV || '').toLowerCase() === 'local';

  return async function aiTrackDevAuthMiddleware(request, response, next) {
    if (bypassEnabled && isLocalDev) {
      request.body = request.body || {};
      request.body.accounts = 'local-dev-ai-track';
      request.authAccount = { _id: 'local-dev-ai-track', email: 'local-dev@example.com' };
      request.authSession = { source: 'local-dev' };
      request.permissionCheck = { action: 'view', paths: ['/ivts/tracking'], source: 'local-dev' };
      return next();
    }
    return accountService.onCheckAuthorization(request, response, next);
  };
}

module.exports = function (app) {
  const path = "/api/v1";

  app.use(path + '/ivts', ivtsRoutes);
  // Mount ai-track routes under /api/v1/ai-track, protected by IAM admin auth and tracking permission.
  try {
    const cameraYamlPath = aiTrackAdapter.resolveAiTrackPath('config/cameras.yaml');
    const canViewAiTrack = authorization.requirePermission('/ivts/tracking', 'view');
    const aiTrackAuthMiddleware = createAiTrackDevAuthMiddleware();
    const bypassEnabled = String(process.env.AI_TRACK_DEV_BYPASS_AUTH || '').toLowerCase() === 'true';
    const isLocalDev = String(process.env.NODE_ENV || '').toLowerCase() === 'development' || String(process.env.PROJECT_ENV || '').toLowerCase() === 'local';
    app.use('/api/v1/ai-track', aiTrackAuthMiddleware);
    if (!(bypassEnabled && isLocalDev)) {
      app.use('/api/v1/ai-track', canViewAiTrack);
    }
    aiTrackRoutes.registerAiTrackRoutes(app, { pool: aiTrackPool, cameraYamlPath });
  } catch (err) {
    console.warn('ai-track: failed to register routes', err && err.message ? err.message : err);
  }
  // Public, read-only API for the Flutter user-mobile-application (no IAM
  // session yet). See backend-node/server/Project/ivts/mobile.routes.js.
  app.use(path + '/mobile', mobileRoutes);
  app.use(path + '/setting', settingsRoutes);
  app.use(path + '/security', securityRoutes);
  app.use(path, accountRoutes);
};
