'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const express = require('express');

const { registerAiTrackRoutes } = require('../server/routes/aiTrack.routes');
const adapter = require('../server/services/aiTrackAdapter');

function createAppWithAiTrackRoutes({ middleware, pool } = {}) {
  const app = express();
  registerAiTrackRoutes(app, {
    pool: pool || {},
    cameraYamlPath: '/tmp/cameras.yaml',
    requireAuthMiddleware: middleware,
  });
  return app;
}

async function requestJson(app, pathName, headers = {}) {
  const server = await new Promise((resolve) => {
    const srv = app.listen(0, '127.0.0.1', () => resolve(srv));
  });

  try {
    const port = server.address().port;
    const response = await fetch(`http://127.0.0.1:${port}${pathName}`, { headers });
    const text = await response.text();
    return {
      status: response.status,
      body: text ? JSON.parse(text) : null,
      headers: response.headers,
    };
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
}

test('ai-track routes block requests when injected auth middleware denies access', async () => {
  let called = false;
  const original = adapter.getRecentVehicles;
  adapter.getRecentVehicles = async () => {
    called = true;
    return [{ global_id: 1 }];
  };

  try {
    const app = createAppWithAiTrackRoutes({
      middleware(req, res, next) {
        if (req.headers['x-allow'] !== 'true') {
          return res.status(403).json({ error: 'forbidden' });
        }
        next();
      },
    });

    const result = await requestJson(app, '/api/v1/ai-track/vehicles/recent');
    assert.equal(result.status, 403);
    assert.deepEqual(result.body, { error: 'forbidden' });
    assert.equal(called, false);
  } finally {
    adapter.getRecentVehicles = original;
  }
});

test('ai-track routes allow requests when injected auth middleware passes', async () => {
  let called = false;
  const original = adapter.getRecentVehicles;
  adapter.getRecentVehicles = async () => {
    called = true;
    return [{ global_id: 2 }];
  };

  try {
    const app = createAppWithAiTrackRoutes({
      middleware(req, res, next) {
        if (req.headers['x-allow'] !== 'true') {
          return res.status(403).json({ error: 'forbidden' });
        }
        next();
      },
    });

    const result = await requestJson(app, '/api/v1/ai-track/vehicles/recent?limit=1', { 'x-allow': 'true' });
    assert.equal(result.status, 200);
    assert.equal(called, true);
    assert.equal(result.body.count, 1);
    assert.deepEqual(result.body.vehicles, [{ global_id: 2 }]);
  } finally {
    adapter.getRecentVehicles = original;
  }
});
