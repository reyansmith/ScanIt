"""
Dashboard API — /api/dashboard/*
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from app.database import get_db
from app.models.user import User
from app.models.scan import Scan
from app.models.profile import UserProfile
from app.api.auth import get_current_user
from app.services.verdict_engine import build_alert_summary

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
async def get_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Recent 10 scans
    result = await db.execute(
        select(Scan)
        .where(Scan.user_id == current_user.id)
        .order_by(desc(Scan.scanned_at))
        .limit(10)
    )
    recent_scans = result.scalars().all()

    # Danger/Caution alerts from recent scans
    alerts = []
    for scan in recent_scans:
        if scan.verdict in ("DANGER", "CAUTION") and scan.flags:
            for summary in build_alert_summary(scan.flags):
                alerts.append({
                    "product_name": scan.product_name,
                    "verdict": scan.verdict,
                    "summary": summary,
                    "scan_id": scan.id,
                    "scanned_at": scan.scanned_at.isoformat(),
                })

    # Stats
    total_result = await db.execute(
        select(func.count()).where(Scan.user_id == current_user.id)
    )
    total_scans = total_result.scalar()

    safe_count = await db.execute(
        select(func.count()).where(Scan.user_id == current_user.id, Scan.verdict == "SAFE")
    )
    danger_count = await db.execute(
        select(func.count()).where(Scan.user_id == current_user.id, Scan.verdict == "DANGER")
    )

    return {
        "total_scans": total_scans,
        "safe_scans": safe_count.scalar(),
        "danger_scans": danger_count.scalar(),
        "recent_scans": [
            {
                "id": s.id,
                "product_name": s.product_name,
                "brand": s.brand,
                "image_url": s.image_url,
                "verdict": s.verdict,
                "scanned_at": s.scanned_at.isoformat(),
            }
            for s in recent_scans
        ],
        "alerts": alerts[:8],
    }


@router.get("/progress")
async def get_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Weekly sodium and sugar averages from scanned products."""
    from datetime import datetime, timedelta, timezone

    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    result = await db.execute(
        select(Scan)
        .where(Scan.user_id == current_user.id, Scan.scanned_at >= seven_days_ago)
    )
    scans = result.scalars().all()

    weekly_sodium = []
    weekly_sugar = []
    weekly_calories = []

    for scan in scans:
        if scan.product_data:
            nl = scan.product_data.get("nutrient_levels", {})
            weekly_sodium.append(nl.get("sodium_100g", 0))
            weekly_sugar.append(nl.get("sugars_100g", 0))
            weekly_calories.append(nl.get("energy_100g", 0))

    def safe_avg(lst): return round(sum(lst) / len(lst), 1) if lst else 0

    return {
        "period": "last_7_days",
        "scans_this_week": len(scans),
        "avg_sodium_mg": safe_avg(weekly_sodium),
        "avg_sugar_g": safe_avg(weekly_sugar),
        "avg_calories_kcal": safe_avg(weekly_calories),
        "safe_pct": round(sum(1 for s in scans if s.verdict == "SAFE") / max(len(scans), 1) * 100, 1),
    }
