"""
Scanner API — /api/scan-product, /api/scans/history
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel, Field

from app.database import get_db
from app.models.scan import Scan
from app.models.profile import UserProfile
from app.models.user import User
from app.services.barcode_service import lookup_product
from app.services.verdict_engine import compute_verdict, build_alert_summary
from app.api.auth import get_current_user
from app.security import InMemoryRateLimiter, validate_barcode

router = APIRouter(prefix="/api", tags=["scanner"])
scan_limiter = InMemoryRateLimiter(limit=30, window_seconds=60)


class ScanRequest(BaseModel):
    barcode: str = Field(min_length=3, max_length=50)


@router.post("/scan-product")
async def scan_product(
    body: ScanRequest,
    _: None = Depends(scan_limiter),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    barcode = validate_barcode(body.barcode)

    # 1. Lookup product
    product = await lookup_product(barcode)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with barcode '{barcode}' not found.")

    # 2. Get user's health conditions
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    conditions: list[str] = profile.health_conditions if profile and profile.health_conditions else []

    # 3. Compute MediVerdict
    verdict_result = compute_verdict(product, conditions)
    alerts = build_alert_summary(verdict_result["flags"])

    # 4. Save scan to history
    scan = Scan(
        user_id=current_user.id,
        barcode=barcode,
        product_name=product.get("product_name"),
        brand=product.get("brand"),
        image_url=product.get("image_url"),
        product_data=product,
        verdict=verdict_result["verdict"],
        flags=verdict_result["flags"],
    )
    db.add(scan)
    await db.flush()

    return {
        "scan_id": scan.id,
        "product": product,
        "verdict": verdict_result["verdict"],
        "flags": verdict_result["flags"],
        "alert_summaries": alerts,
    }


@router.get("/scan-product/{barcode}")
async def get_product_by_barcode(
    barcode: str,
    _: None = Depends(scan_limiter),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cached product lookup (no new scan record)."""
    barcode = validate_barcode(barcode)
    product = await lookup_product(barcode)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"product": product}


@router.get("/scans/history")
async def get_scan_history(
    page: int = Query(1, ge=1, le=1000),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * per_page
    result = await db.execute(
        select(Scan)
        .where(Scan.user_id == current_user.id)
        .order_by(desc(Scan.scanned_at))
        .offset(offset)
        .limit(per_page)
    )
    scans = result.scalars().all()
    return {
        "page": page,
        "per_page": per_page,
        "scans": [
            {
                "id": s.id,
                "barcode": s.barcode,
                "product_name": s.product_name,
                "brand": s.brand,
                "image_url": s.image_url,
                "verdict": s.verdict,
                "flags": s.flags,
                "scanned_at": s.scanned_at.isoformat(),
            }
            for s in scans
        ],
    }
