// Lightweight AI Track adapter for backend-node
// Exposes functions that use a provided `pg` Pool. Optional deps are
// required dynamically so this file can be loaded even if pg/js-yaml
// are not installed in the current environment.
const fs = require('fs');
const path = require('path');

let yaml = null;
try {
  yaml = require('js-yaml');
} catch (e) {
  // optional dependency; caller may only use SQL helpers
}

function loadYamlFile(yamlPath) {
  if (!yaml) throw new Error('js-yaml is required to load camera YAML files');
  const raw = fs.readFileSync(yamlPath, 'utf8');
  return yaml.load(raw) || {};
}

function formatTimestamp(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString().replace('T', ' ').slice(0, 19);
  }
  return String(value);
}

function sqlRecentVehicles() {
  return `SELECT vi.global_id, vi.first_seen, vi.last_seen, COUNT(DISTINCT vl.camera_id) AS cameras_visited
    FROM vehicle_identities vi
    JOIN vehicle_logs vl ON vl.global_id = vi.global_id
    GROUP BY vi.global_id, vi.first_seen, vi.last_seen
    ORDER BY vi.last_seen DESC
    LIMIT $1;`;
}

function sqlTimelineByGlobalId() {
  return `SELECT log_id, global_id, track_id, camera_id, timestamp, predicted_class, detected_lat, detected_lng
    FROM vehicle_logs
    WHERE global_id = $1
    ORDER BY timestamp ASC;`;
}

function sqlVehiclesVisitingAll() {
  return `SELECT global_id, array_agg(DISTINCT camera_id) AS cameras_visited,
           MIN(timestamp) AS first_seen, MAX(timestamp) AS last_seen
    FROM vehicle_logs
    WHERE global_id IS NOT NULL
    GROUP BY global_id
    HAVING ($1::varchar[] IS NULL OR array_agg(DISTINCT camera_id) @> $1::varchar[])
    ORDER BY last_seen DESC;`;
}

async function getRecentVehicles(pool, limit = 50) {
  const sql = sqlRecentVehicles();
  const client = await pool.connect();
  try {
    const res = await client.query(sql, [limit]);
    return res.rows;
  } finally {
    client.release();
  }
}

async function getVehicleTimeline(pool, globalId) {
  const sql = sqlTimelineByGlobalId();
  const client = await pool.connect();
  try {
    const res = await client.query(sql, [globalId]);
    return res.rows;
  } finally {
    client.release();
  }
}

async function getVehiclesVisitingAllCameras(pool, cameraIds) {
  const sql = sqlVehiclesVisitingAll();
  const client = await pool.connect();
  try {
    const res = await client.query(sql, [cameraIds]);
    return res.rows;
  } finally {
    client.release();
  }
}

function loadCamerasFromYaml(yamlPath) {
  const parsed = loadYamlFile(yamlPath);
  const cams = parsed.cameras || [];
  return Object.fromEntries(cams.map(c => [c.id, c]));
}

function loadRouteSegmentsFromYaml(yamlPath) {
  const parsed = loadYamlFile(yamlPath);
  return parsed.segments || [];
}

function getRouteWaypoints(routeSegments, cameraFrom, cameraTo) {
  for (const seg of routeSegments) {
    if (seg.from && seg.to) {
      if (seg.from === cameraFrom && seg.to === cameraTo) {
        return seg.waypoints || [];
      }
      continue;
    }
    const [camA, camB] = seg.between || [];
    if (camA === cameraFrom && camB === cameraTo) {
      return seg.waypoints || [];
    }
    if (camA === cameraTo && camB === cameraFrom) {
      return (seg.waypoints || []).slice().reverse();
    }
  }
  return [];
}

function formatTimeline(rows, camMap) {
  return rows.map(row => {
    const cam = camMap[row.camera_id] || {};
    const lat = row.detected_lat != null ? row.detected_lat : cam.lat;
    const lng = row.detected_lng != null ? row.detected_lng : cam.lng;
    return {
      log_id: row.log_id,
      global_id: row.global_id,
      track_id: row.track_id,
      camera_id: row.camera_id,
      location_name: cam.location_name || null,
      timestamp: formatTimestamp(row.timestamp),
      predicted_class: row.predicted_class,
      lat,
      lng,
    };
  });
}

function buildRoutePolyline(formattedTimeline, routeSegments) {
  const route = [];
  for (let i = 0; i < formattedTimeline.length; i += 1) {
    const point = formattedTimeline[i];
    if (i > 0) {
      const prevPoint = formattedTimeline[i - 1];
      const waypoints = getRouteWaypoints(routeSegments, prevPoint.camera_id, point.camera_id);
      route.push(...waypoints);
    }
    route.push([point.lat, point.lng]);
  }
  return route;
}

module.exports = {
  // SQL helpers (for testing and direct DB use)
  sqlRecentVehicles,
  sqlTimelineByGlobalId,
  sqlVehiclesVisitingAll,
  // runtime functions (require a pg Pool)
  getRecentVehicles,
  getVehicleTimeline,
  getVehiclesVisitingAllCameras,
  // camera/route loaders
  loadCamerasFromYaml,
  loadRouteSegmentsFromYaml,
  // timeline helpers
  formatTimeline,
  buildRoutePolyline,
};
