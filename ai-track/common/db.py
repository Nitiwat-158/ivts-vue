"""
Shared PostgreSQL access layer.

Every other module (real-time pipeline, ReID matcher, FastAPI, CLI tools)
goes through here instead of opening its own ad-hoc psycopg2 connections
with copy-pasted DB_CONFIG dicts, like the original scripts did.
"""
from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime
from typing import Iterator, List, Optional

import psycopg2
import psycopg2.extras
from psycopg2.extras import RealDictCursor

from common.config import AppConfig


def vector_to_pgvector_literal(vector: List[float]) -> str:
    return "[" + ",".join(map(str, vector)) + "]"


class Database:
    def __init__(self, config: AppConfig):
        self._db_kwargs = config.db.as_psycopg2_kwargs()

    @contextmanager
    def connection(self) -> Iterator[psycopg2.extensions.connection]:
        conn = psycopg2.connect(**self._db_kwargs)
        try:
            yield conn
        finally:
            conn.close()

    # ------------------------------------------------------------------
    # Writes
    # ------------------------------------------------------------------
    def create_new_identity(self, cur, timestamp: datetime) -> int:
        cur.execute(
            "INSERT INTO vehicle_identities (first_seen, last_seen) VALUES (%s, %s) RETURNING global_id;",
            (timestamp, timestamp),
        )
        return cur.fetchone()[0]

    def touch_identity(self, cur, global_id: int, timestamp: datetime) -> None:
        cur.execute(
            "UPDATE vehicle_identities SET last_seen = %s WHERE global_id = %s;",
            (timestamp, global_id),
        )

    def insert_vehicle_log(
        self,
        cur,
        global_id: int,
        track_id: int,
        camera_id: str,
        predicted_class: str,
        vector: List[float],
        timestamp: Optional[datetime] = None,
        detected_lat: Optional[float] = None,
        detected_lng: Optional[float] = None,
        box_area: Optional[float] = None,
    ) -> int:
        vector_str = vector_to_pgvector_literal(vector)
        ts = timestamp if timestamp is not None else datetime.now()
        cur.execute(
            """
            INSERT INTO vehicle_logs
                (global_id, track_id, camera_id, timestamp, live_vector, predicted_class, detected_lat, detected_lng, box_area)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING log_id, timestamp;
            """,
            (global_id, int(track_id), camera_id, ts, vector_str, predicted_class, detected_lat, detected_lng, box_area),
        )
        return cur.fetchone()[0]

    # ------------------------------------------------------------------
    # Reads used by the ReID matcher
    # ------------------------------------------------------------------
    def find_nearest_recent_matches(
        self,
        cur,
        camera_id: str,
        vector: List[float],
        timestamp: datetime,
        window_minutes: int,
        limit: int = 5,
    ):
        """
        Find the top `limit` closest vehicle_logs rows from a DIFFERENT
        camera within the matching time window, using pgvector cosine
        distance, ordered nearest-first. Returns a list of
        (global_id, distance, camera_id, timestamp) tuples (may be empty).

        Returning multiple candidates (not just the single nearest) lets the
        matcher skip a match that's physically implausible (e.g. would need
        impossible travel speed - see common/reid_matcher.py) and fall
        through to try the next-best candidate instead.
        """
        vector_str = vector_to_pgvector_literal(vector)
        cur.execute(
            """
            SELECT global_id, (live_vector <=> %s) AS distance, camera_id, timestamp
            FROM vehicle_logs
            WHERE camera_id != %s
              AND global_id IS NOT NULL
              AND timestamp >= %s - (%s || ' minutes')::interval
              AND timestamp <= %s
            ORDER BY live_vector <=> %s
            LIMIT %s;
            """,
            (vector_str, camera_id, timestamp, window_minutes, timestamp, vector_str, limit),
        )
        return cur.fetchall()  # list of (global_id, distance, camera_id, timestamp), nearest first

    # ------------------------------------------------------------------
    # Multi-camera fusion (overlapping FOVs seeing the same vehicle at
    # nearly the same instant) - see common/fusion.py for the weighting logic.
    # ------------------------------------------------------------------
    def get_recent_log_for_fusion(
        self,
        cur,
        global_id: int,
        exclude_camera_id: str,
        new_timestamp: datetime,
        window_seconds: float,
    ):
        """
        Finds the most recent log for this SAME global_id, from a DIFFERENT
        camera, within `window_seconds` before `new_timestamp` - a candidate
        for fusing with the incoming detection instead of creating a second,
        zigzag-causing point. Only considers rows that actually have a
        computed GPS position (both detections need one to be fusable).
        """
        cur.execute(
            """
            SELECT log_id, camera_id, detected_lat, detected_lng, box_area, timestamp
            FROM vehicle_logs
            WHERE global_id = %s
              AND camera_id != %s
              AND detected_lat IS NOT NULL
              AND detected_lng IS NOT NULL
              AND timestamp >= %s::timestamp - (%s || ' seconds')::interval
              AND timestamp <= %s::timestamp
            ORDER BY timestamp DESC
            LIMIT 1;
            """,
            (global_id, exclude_camera_id, new_timestamp, window_seconds, new_timestamp),
        )
        return cur.fetchone()

    def fuse_update_log(
        self,
        cur,
        log_id: int,
        fused_lat: float,
        fused_lng: float,
        fused_box_area: float,
        fused_timestamp: datetime,
    ) -> None:
        """Updates an existing log row in place with a fused position, instead of inserting a new row."""
        cur.execute(
            """
            UPDATE vehicle_logs
            SET detected_lat = %s, detected_lng = %s, box_area = %s, timestamp = %s
            WHERE log_id = %s;
            """,
            (fused_lat, fused_lng, fused_box_area, fused_timestamp, log_id),
        )

    # ------------------------------------------------------------------
    # Used by tools/backfill_fusion.py to retroactively fuse OLD data that
    # predates the live fusion feature.
    # ------------------------------------------------------------------
    def get_all_global_ids(self, cur) -> List[int]:
        cur.execute("SELECT global_id FROM vehicle_identities ORDER BY global_id;")
        return [row[0] for row in cur.fetchall()]

    def get_last_known_position(self, cur, global_id: int):
        cur.execute(
            """
            SELECT camera_id, timestamp
            FROM vehicle_logs
            WHERE global_id = %s
            ORDER BY timestamp DESC
            LIMIT 1;
            """,
            (global_id,),
        )
        return cur.fetchone()

    def get_full_logs_for_global_id(self, cur, global_id: int) -> List[tuple]:
        """Returns (log_id, camera_id, timestamp, detected_lat, detected_lng, box_area) ordered oldest -> newest."""
        cur.execute(
            """
            SELECT log_id, camera_id, timestamp, detected_lat, detected_lng, box_area
            FROM vehicle_logs
            WHERE global_id = %s
            ORDER BY timestamp ASC;
            """,
            (global_id,),
        )
        return cur.fetchall()

    def delete_logs(self, cur, log_ids: List[int]) -> None:
        if not log_ids:
            return
        cur.execute("DELETE FROM vehicle_logs WHERE log_id = ANY(%s);", (log_ids,))

    # ------------------------------------------------------------------
    # Reads used by the API
    # ------------------------------------------------------------------
    def get_timeline_by_global_id(self, cur, global_id: int) -> List[dict]:
        cur.execute(
            """
            SELECT log_id, global_id, track_id, camera_id, timestamp, predicted_class, detected_lat, detected_lng
            FROM vehicle_logs
            WHERE global_id = %s
            ORDER BY timestamp ASC;
            """,
            (global_id,),
        )
        return cur.fetchall()

    def get_recent_vehicles(self, cur, limit: int = 50) -> List[dict]:
        cur.execute(
            """
            SELECT vi.global_id, vi.first_seen, vi.last_seen, COUNT(DISTINCT vl.camera_id) AS cameras_visited
            FROM vehicle_identities vi
            JOIN vehicle_logs vl ON vl.global_id = vi.global_id
            GROUP BY vi.global_id, vi.first_seen, vi.last_seen
            ORDER BY vi.last_seen DESC
            LIMIT %s;
            """,
            (limit,),
        )
        return cur.fetchall()

    def get_vehicles_visiting_all_cameras(self, cur, required_camera_ids: List[str]) -> List[dict]:
        """
        Finds global_ids whose detections collectively cover EVERY camera in
        required_camera_ids (order doesn't matter; visiting additional
        cameras beyond the required set is fine too). Useful for e.g.
        "find vehicles that went through CAM01, CAM02, CAM03, AND CAM05".
        """
        cur.execute(
            """
            SELECT global_id, array_agg(DISTINCT camera_id) AS cameras_visited,
                   MIN(timestamp) AS first_seen, MAX(timestamp) AS last_seen
            FROM vehicle_logs
            WHERE global_id IS NOT NULL
            GROUP BY global_id
            HAVING array_agg(DISTINCT camera_id) @> %s::varchar[]
            ORDER BY last_seen DESC;
            """,
            (required_camera_ids,),
        )
        return cur.fetchall()

    def get_log_by_id(self, cur, log_id: int):
        cur.execute(
            "SELECT log_id, global_id, camera_id, timestamp, live_vector FROM vehicle_logs WHERE log_id = %s;",
            (log_id,),
        )
        return cur.fetchone()


def get_dict_cursor(conn):
    return conn.cursor(cursor_factory=RealDictCursor)