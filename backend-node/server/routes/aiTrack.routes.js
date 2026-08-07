// Routes scaffold for AI Track - register with an Express `app` instance.
// This file avoids requiring `express` at load time to stay safe in
// environments where dependencies may not be installed; call
// `registerAiTrackRoutes(app, { pool, cameraYamlPath, requireAuth })`
// from your main server to wire the routes.

const pathLib = require('path');
const adapter = require('../services/aiTrackAdapter');

function makeRouteHandlers({ pool, cameraYamlPath, requireAuth }) {
  async function getCamerasHandler(req, res) {
    try {
      const camMap = adapter.loadCamerasFromYaml(cameraYamlPath);
      // Transform to { id: { lat, lng, location_name } }
      const result = Object.fromEntries(Object.values(camMap).map(c => [c.id, { lat: c.lat, lng: c.lng, location_name: c.location_name }]));
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  }

  async function getRecentHandler(req, res) {
    try {
      const limit = parseInt(req.query.limit || '50', 10);
      const rows = await adapter.getRecentVehicles(pool, limit);
      res.json({ count: rows.length, vehicles: rows });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  }

  async function getFullRouteHandler(req, res) {
    try {
      const cams = req.query.cameras ? req.query.cameras.split(',').map(s => s.trim()) : null;
      const required = cams || null;
      const rows = await adapter.getVehiclesVisitingAllCameras(pool, required);
      const results = rows.map(r => ({ global_id: r.global_id, cameras_visited: r.cameras_visited, first_seen: r.first_seen, last_seen: r.last_seen }));
      res.json({ required_cameras: required, count: results.length, vehicles: results });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  }

  async function getTimelineHandler(req, res) {
    try {
      const globalId = parseInt(req.params.global_id, 10);
      if (Number.isNaN(globalId)) return res.status(400).json({ error: 'invalid global_id' });
      const rows = await adapter.getVehicleTimeline(pool, globalId);
      if (!rows || rows.length === 0) return res.status(404).json({ error: 'not found' });

      const camMap = adapter.loadCamerasFromYaml(cameraYamlPath);
      const routeSegmentsPath = pathLib.resolve(__dirname, '../../..', 'ai-track', 'config', 'route_segments.yaml');
      const routeSegments = adapter.loadRouteSegmentsFromYaml(routeSegmentsPath);
      const formattedTimeline = adapter.formatTimeline(rows, camMap);
      const route = adapter.buildRoutePolyline(formattedTimeline, routeSegments);

      res.json({
        global_id: globalId,
        total_records: formattedTimeline.length,
        timeline: formattedTimeline,
        route,
      });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  }

  return { getCamerasHandler, getRecentHandler, getFullRouteHandler, getTimelineHandler };
}

function registerAiTrackRoutes(app, opts) {
  // opts: { pool, cameraYamlPath, requireAuthMiddleware }
  if (!app) throw new Error('Express app instance required');
  const handlers = makeRouteHandlers(opts);
  const base = (opts && opts.basePath) || '/api/v1/ai-track';
  const router = (opts && opts.expressRouter) || (app && app.Router ? app.Router() : null);
  // If Router not available, attach directly to app
  if (router) {
    // Apply optional injected auth middleware at the router level so all
    // registered routes are protected. `requireAuthMiddleware` may be a
    // single middleware function or an array of middleware.
    const authMw = opts && (opts.requireAuthMiddleware || opts.requireAuth);
    if (authMw) {
      if (Array.isArray(authMw)) authMw.forEach(m => router.use(m));
      else router.use(authMw);
    }
    router.get('/cameras', handlers.getCamerasHandler);
    router.get('/vehicles/recent', handlers.getRecentHandler);
    router.get('/vehicles/full-route', handlers.getFullRouteHandler);
    router.get('/vehicle/:global_id/timeline', handlers.getTimelineHandler);
    app.use(base, router);
  } else {
    // If middleware is provided but Router isn't available, mount it on the
    // app at the base path so it's applied to the routes registered below.
    const authMw = opts && (opts.requireAuthMiddleware || opts.requireAuth);
    if (authMw) {
      if (Array.isArray(authMw)) authMw.forEach(m => app.use(base, m));
      else app.use(base, authMw);
    }
    app.get(base + '/cameras', handlers.getCamerasHandler);
    app.get(base + '/vehicles/recent', handlers.getRecentHandler);
    app.get(base + '/vehicles/full-route', handlers.getFullRouteHandler);
    app.get(base + '/vehicle/:global_id/timeline', handlers.getTimelineHandler);
  }
}

module.exports = { registerAiTrackRoutes, makeRouteHandlers };
