"""
MediBot API — /api/bot/chat
Streams AI responses. Requires OPENROUTER_API_KEY in config to function fully.
Falls back to a helpful static message if no key is configured.
"""

import asyncio
import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field

from app.database import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.api.auth import get_current_user
from app.config import settings
from app.security import InMemoryRateLimiter

router = APIRouter(prefix="/api/bot", tags=["medibot"])
bot_limiter = InMemoryRateLimiter(limit=20, window_seconds=60)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    product_context: dict = Field(default_factory=dict)
    chat_history: list[dict] = Field(default_factory=list, max_length=20)


def _build_fallback_response(message: str, product_context: dict, profile_ctx: dict) -> str:
    product_name = product_context.get("product_name")
    brand = product_context.get("brand")
    verdict = product_context.get("verdict")
    flags = product_context.get("flags") or []
    alert_summaries = product_context.get("alert_summaries") or []
    conditions = profile_ctx.get("health_conditions") or []

    if product_name and verdict:
        badge = "🟢 Safe" if verdict == "SAFE" else ("🟡 Caution" if verdict == "CAUTION" else "🔴 Danger")
        item_str = f"**Scanned Item:** {product_name}" + (f" ({brand})" if brand else "")
        verdict_str = f"**Verdict:** {badge}"

        if alert_summaries or flags:
            items = alert_summaries if alert_summaries else [f"[{f.get('condition','General')}] {f.get('reason','Flagged')}" for f in flags]
            warnings = "\n".join([f"• {item}" for item in items])
            analysis = f"**Flagged Warnings:**\n{warnings}"
        else:
            analysis = "✅ **Status:** No ingredient or nutritional risks detected for your profile conditions!"

        return (
            f"Hi! I'm MediBot 🩺\n\n"
            f"{item_str}\n"
            f"{verdict_str}\n\n"
            f"{analysis}\n\n"
            f"💡 *Tip: Check the Community page for safe alternative recipes and products!*"
        )

    cond_text = f"I'm ready to check items for your profile ({', '.join(conditions)})." if conditions else "Visit Profile Setup to set your health conditions!"
    return (
        f"Hi! I'm MediBot 🩺\n\n"
        f"To evaluate a product or suggest safer alternatives, please scan a product barcode first in the **Scanner** tab!\n\n"
        f"Once scanned, I will audit its ingredients and nutrients for you. {cond_text}"
    )


@router.post("/chat")
async def chat(
    body: ChatRequest,
    _: None = Depends(bot_limiter),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    profile_ctx = {
        "health_conditions": profile.health_conditions if profile else [],
        "age": profile.age if profile else "N/A",
        "weight_kg": profile.weight_kg if profile else "N/A",
        "height_cm": profile.height_cm if profile else "N/A",
        "activity_level": profile.activity_level if profile else "N/A",
    }

    # Use real LangChain streaming if OpenRouter key is present
    if settings.OPENROUTER_API_KEY:
        try:
            from app.services.bot_service import stream_medibot_response

            async def sse_ai():
                async for token in stream_medibot_response(
                    message=body.message,
                    product_context=body.product_context,
                    profile_context=profile_ctx,
                    chat_history=body.chat_history,
                ):
                    yield f"data: {json.dumps({'token': token})}\n\n"
                yield "data: [DONE]\n\n"

            return StreamingResponse(sse_ai(), media_type="text/event-stream",
                                     headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
        except Exception:
            pass

    # Fallback: stream response cleanly word by word
    fallback = _build_fallback_response(body.message, body.product_context, profile_ctx)

    async def sse_fallback():
        words = fallback.split(" ")
        for i, word in enumerate(words):
            chunk = word if i == len(words) - 1 else word + " "
            yield f"data: {json.dumps({'token': chunk})}\n\n"
            await asyncio.sleep(0.008)
        yield "data: [DONE]\n\n"

    return StreamingResponse(sse_fallback(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
