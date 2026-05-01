"""
MediBot AI Service — LangChain streaming agent with product + health profile context.
"""

import json
from typing import AsyncIterator, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, SystemMessage
from app.config import settings

SYSTEM_TEMPLATE = """You are MediBot, a knowledgeable, empathetic, and scientifically rigorous health assistant \
embedded in the MediScan platform.

## User Health Profile
- Health Conditions: {conditions}
- Age: {age} | Weight: {weight_kg}kg | Height: {height_cm}cm
- Activity Level: {activity_level}

## Currently Scanned Product
- Product Name: {product_name}
- Brand: {brand}
- MediVerdict: {verdict}
- Flags: {flags_summary}
- Ingredients: {ingredients_text}
- Nutritional Data (per 100g):
{nutritional_data}

## Your Responsibilities
1. Answer questions about whether this specific product is safe for this specific user.
2. Explain in plain language WHY the product was flagged — cite nutrients and ingredients.
3. Suggest specific safer alternatives when asked.
4. Answer diet-pattern questions (keto, vegan, FODMAP, etc.).
5. Be concise, warm, and evidence-based.
6. NEVER diagnose conditions or replace medical advice. Always recommend consulting a doctor for medical decisions.
7. If a question is unrelated to health/nutrition, politely redirect.

Respond in 2-4 sentences unless a detailed breakdown is explicitly requested."""


def _build_nutritional_summary(nutrient_levels: dict) -> str:
    lines = []
    labels = {
        "energy_100g": ("Energy", "kcal"),
        "fat_100g": ("Total Fat", "g"),
        "saturated-fat_100g": ("Saturated Fat", "g"),
        "carbohydrates_100g": ("Carbohydrates", "g"),
        "sugars_100g": ("Sugars", "g"),
        "proteins_100g": ("Protein", "g"),
        "sodium_100g": ("Sodium", "mg"),
        "fiber_100g": ("Fiber", "g"),
    }
    for key, (label, unit) in labels.items():
        val = nutrient_levels.get(key, 0)
        if val:
            lines.append(f"  - {label}: {val:.1f}{unit}")
    return "\n".join(lines) or "  - Not available"


def _build_flags_summary(flags: list[dict]) -> str:
    if not flags:
        return "No flags — product appears safe for your conditions."
    parts = []
    for f in flags:
        if f.get("value") is not None:
            parts.append(f"{f['reason']} ({f['value']:.1f}{f.get('unit','')} > limit {f.get('threshold','')})")
        else:
            parts.append(f"{f['reason']} (contains '{f.get('keyword','')}')")
    return "; ".join(parts)


async def stream_medibot_response(
    message: str,
    product_context: dict[str, Any],
    profile_context: dict[str, Any],
    chat_history: list[dict] | None = None,
) -> AsyncIterator[str]:
    """
    Yields SSE-formatted token chunks for streaming to the frontend.
    """
    llm = ChatOpenAI(
        model=settings.OPENROUTER_MODEL,
        api_key=settings.OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1",
        default_headers={
            "HTTP-Referer": "http://localhost:5173", # Update in prod
            "X-Title": "MediScan",
        },
        streaming=True,
        temperature=0.4,
    )

    system_content = SYSTEM_TEMPLATE.format(
        conditions=", ".join(profile_context.get("health_conditions", [])) or "None specified",
        age=profile_context.get("age", "N/A"),
        weight_kg=profile_context.get("weight_kg", "N/A"),
        height_cm=profile_context.get("height_cm", "N/A"),
        activity_level=profile_context.get("activity_level", "N/A"),
        product_name=product_context.get("product_name", "Unknown"),
        brand=product_context.get("brand", ""),
        verdict=product_context.get("verdict", "UNKNOWN"),
        flags_summary=_build_flags_summary(product_context.get("flags", [])),
        ingredients_text=product_context.get("ingredients_text", "Not available")[:500],
        nutritional_data=_build_nutritional_summary(product_context.get("nutrient_levels", {})),
    )

    messages = [SystemMessage(content=system_content)]
    if chat_history:
        for msg in chat_history[-6:]:  # last 3 turns context window
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
    messages.append(HumanMessage(content=message))

    async for chunk in llm.astream(messages):
        if chunk.content:
            yield chunk.content
