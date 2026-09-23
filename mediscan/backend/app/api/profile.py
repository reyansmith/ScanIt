"""
Profile API — /api/profile/*
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field
from typing import Optional, List

from app.database import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["profile"])

VALID_CONDITIONS = [
    "Type 1 Diabetes",
    "Type 2 Diabetes",
    "Hypertension (High Blood Pressure)",
    "Hypercholesterolemia (High Cholesterol)",
    "Chronic Kidney Disease (CKD)",
    "Celiac Disease",
    "Nut Allergy (General)",
    "Dairy Allergy",
    "IBS/FODMAP Sensitivity",
]

VALID_ACTIVITY_LEVELS = ["sedentary", "light", "moderate", "active"]


class ProfileUpdate(BaseModel):
    height_cm: Optional[float] = Field(default=None, ge=30, le=300)
    weight_kg: Optional[float] = Field(default=None, ge=1, le=700)
    age: Optional[int] = Field(default=None, ge=1, le=130)
    activity_level: Optional[str] = Field(default=None, max_length=30)
    health_conditions: Optional[List[str]] = Field(default=None, max_length=20)
    dietary_goals: Optional[dict] = Field(default=None)


@router.get("")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "profile_complete": current_user.profile_complete,
        },
        "profile": {
            "height_cm": profile.height_cm if profile else None,
            "weight_kg": profile.weight_kg if profile else None,
            "age": profile.age if profile else None,
            "activity_level": profile.activity_level if profile else None,
            "health_conditions": profile.health_conditions if profile else [],
            "dietary_goals": profile.dietary_goals if profile else {},
        } if profile else None,
    }


@router.put("")
async def update_profile(
    body: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Validate conditions
    if body.health_conditions is not None:
        invalid = [c for c in body.health_conditions if c not in VALID_CONDITIONS]
        if invalid:
            raise HTTPException(status_code=422, detail=f"Invalid conditions: {invalid}")

    if body.activity_level and body.activity_level not in VALID_ACTIVITY_LEVELS:
        raise HTTPException(status_code=422, detail=f"activity_level must be one of {VALID_ACTIVITY_LEVELS}")

    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()

    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    if body.height_cm is not None: profile.height_cm = body.height_cm
    if body.weight_kg is not None: profile.weight_kg = body.weight_kg
    if body.age is not None: profile.age = body.age
    if body.activity_level is not None: profile.activity_level = body.activity_level
    if body.health_conditions is not None: profile.health_conditions = body.health_conditions
    if body.dietary_goals is not None: profile.dietary_goals = body.dietary_goals

    # Mark profile as complete if essential fields filled
    if all([profile.height_cm, profile.weight_kg, profile.age]):
        current_user.profile_complete = True

    await db.flush()
    return {"message": "Profile updated successfully"}


@router.get("/conditions")
async def list_conditions():
    """Return all supported health conditions for the frontend dropdown."""
    return {"conditions": VALID_CONDITIONS}
