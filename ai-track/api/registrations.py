from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from common.db import Database, get_dict_cursor
from common.config import load_config

config = load_config()
db = Database(config)

router = APIRouter()

class RegisterVehicleRequest(BaseModel):
    """Request body for user -> vehicle reference registration.

    vehicle_id is REQUIRED here because the ownership table is keyed on
    (user_id, vehicle_id) and a vehicle registration without a vehicle
    identifier is ambiguous and cannot be reconciled safely.
    """
    user_id: str
    vehicle_id: str
    global_id: int
    nickname: Optional[str] = None

class MatchVehicleRequest(BaseModel):
    global_id: int
    threshold: Optional[float] = 0.15

@router.post('/api/vehicles/register')
def register_vehicle(payload: RegisterVehicleRequest):
    """Register a user-owned reference vector for a user/vehicle pair."""
    if not payload.vehicle_id or not str(payload.vehicle_id).strip():
        raise HTTPException(
            status_code=400,
            detail='vehicle_id is required: POST /api/vehicles/register must include the vehicle identifier being owned by this user',
        )

    try:
        with db.connection() as conn:
            cur = conn.cursor()
            avg_vector = db.average_live_vectors_for_global_id(cur, payload.global_id)
            db.upsert_registered_vehicle_reference(
                cur,
                payload.user_id,
                payload.vehicle_id,
                payload.global_id,
                avg_vector,
                payload.nickname,
            )
            conn.commit()
        return {
            'status': 'ok',
            'user_id': payload.user_id,
            'vehicle_id': payload.vehicle_id,
            'global_id': payload.global_id,
            'nickname': payload.nickname,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/api/vehicles/match')
def match_vehicle(payload: MatchVehicleRequest):
    """Match a live vehicle global_id to a registered user/vehicle pair."""
    try:
        with db.connection() as conn:
            cur = conn.cursor()
            avg_vector = db.average_live_vectors_for_global_id(cur, payload.global_id)
            match = db.find_registered_vehicle_match(cur, avg_vector, payload.threshold)

        if not match:
            raise HTTPException(status_code=404, detail='no registered ownership match found')

        return {'status': 'ok', 'match': match}
    except HTTPException:
        raise
    except Exception as e:
        print(f"🔥 เกิดข้อผิดพลาดใน Python: {e}")
        raise HTTPException(status_code=500, detail=str(e))
