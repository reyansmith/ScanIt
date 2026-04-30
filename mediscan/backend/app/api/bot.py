"""
MediBot API — /api/bot/chat
Streams AI responses. Requires OPENAI_API_KEY in config to function fully.
Falls back to a helpful static message if no key is configured.
"""

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.api.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/api/bot", tags=["medibot"])


class ChatRequest(BaseModel):
    message: str
    product_context: dict = {}
    chat_history: list[dict] = []


def _build_fallback_response(message: str, product_context: dict) -> str:
    product_name = product_context.get("product_name", "this product")
    verdict = product_context.get("verdict", "")
    return (
        f"Hi! I'm MediBot 🩺 You asked: \"{message}\"\n\n"
        f"Based on what I can see, {product_name} has a verdict of **{verdict or 'Unknown'}**.\n\n"
        f"To get full AI-powered answers, please add your OpenAI API key to the backend `.env` file "
        f"(`OPENAI_API_KEY=sk-...`) and restart the backend."
    )


@router.post("/chat")
async def chat(
    body: ChatRequest,
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

    # Use real LangChain streaming if OpenAI key is present
    if settings.OPENAI_API_KEY:
        try:
            from app.services.bot_service import stream_medibot_response

            async def sse_ai():
                async for token in stream_medibot_response(
                    message=body.message,
                    product_context=body.product_context,
                    profile_context=profile_ctx,
                    chat_history=body.chat_history,
                ):
                    yield f"data: {token}\n\n"
                yield "data: [DONE]\n\n"

            return StreamingResponse(sse_ai(), media_type="text/event-stream",
                                     headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
        except ImportError:
            pass

    # Fallback: stream static response character by character
    fallback = _build_fallback_response(body.message, body.product_context)

    async def sse_fallback():
        for char in fallback:
            yield f"data: {char}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(sse_fallback(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
