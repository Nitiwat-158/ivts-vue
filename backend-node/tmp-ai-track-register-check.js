const express = require('express');
const { registerAiTrackRoutes } = require('./server/routes/aiTrack.routes');
const app = express();
app.use(express.json());
registerAiTrackRoutes(app, {
  pool: {},
  cameraYamlPath: './ai-track/config/cameras.yaml',
  requireAuthMiddleware: (req, res, next) => next(),
});
const server = app.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/ai-track/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('BODY', text);
  } catch (err) {
    console.error('ERROR', err);
  } finally {
    server.close();
  }
});
