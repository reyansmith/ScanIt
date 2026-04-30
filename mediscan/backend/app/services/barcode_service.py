"""
Barcode / product lookup service.
Primary source: OpenFoodFacts (free, no key required)
Fallback:       Nutritionix (requires API keys)
"""

import asyncio
import aiohttp
from typing import Any
from app.config import settings


OPEN_FOOD_FACTS_URL = "https://world.openfoodfacts.org/api/v2/product/{barcode}.json"
NUTRITIONIX_SEARCH_URL = "https://trackapi.nutritionix.com/v2/search/item"


async def _fetch_openfoodfacts(barcode: str) -> dict[str, Any] | None:
    url = OPEN_FOOD_FACTS_URL.format(barcode=barcode)
    async with aiohttp.ClientSession() as session:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=8)) as resp:
            if resp.status != 200:
                return None
            data = await resp.json()
            if data.get("status") != 1:
                return None
            return _normalize_off_product(data["product"])


def _normalize_off_product(raw: dict) -> dict[str, Any]:
    """Normalize OpenFoodFacts product into a flat, predictable schema."""
    nutriments = raw.get("nutriments", {})
    return {
        "barcode": raw.get("code", ""),
        "product_name": raw.get("product_name", "Unknown Product"),
        "brand": raw.get("brands", ""),
        "image_url": raw.get("image_front_url", ""),
        "ingredients_text": raw.get("ingredients_text_en") or raw.get("ingredients_text", ""),
        "allergens": raw.get("allergens_tags", []),
        "labels": raw.get("labels_tags", []),
        "categories": raw.get("categories_tags", []),
        "quantity": raw.get("quantity", ""),
        "serving_size": raw.get("serving_size", ""),
        "nutriscore_grade": raw.get("nutriscore_grade", "").upper(),
        "nutrient_levels": {
            "energy_100g":           nutriments.get("energy-kcal_100g", 0),
            "fat_100g":              nutriments.get("fat_100g", 0),
            "saturated-fat_100g":    nutriments.get("saturated-fat_100g", 0),
            "trans-fat_100g":        nutriments.get("trans-fat_100g", 0),
            "carbohydrates_100g":    nutriments.get("carbohydrates_100g", 0),
            "sugars_100g":           nutriments.get("sugars_100g", 0),
            "fiber_100g":            nutriments.get("fiber_100g", 0),
            "proteins_100g":         nutriments.get("proteins_100g", 0),
            "sodium_100g":           nutriments.get("sodium_100g", 0) * 1000,  # convert g → mg
            "salt_100g":             nutriments.get("salt_100g", 0),
            "potassium_100g":        nutriments.get("potassium_100g", 0),
            "phosphorus_100g":       nutriments.get("phosphorus_100g", 0),
        },
        "source": "openfoodfacts",
    }


async def _fetch_nutritionix(barcode: str) -> dict[str, Any] | None:
    if not settings.NUTRITIONIX_APP_ID or not settings.NUTRITIONIX_API_KEY:
        return None
    headers = {
        "x-app-id": settings.NUTRITIONIX_APP_ID,
        "x-app-key": settings.NUTRITIONIX_API_KEY,
        "Content-Type": "application/json",
    }
    params = {"upc": barcode}
    async with aiohttp.ClientSession() as session:
        async with session.get(
            NUTRITIONIX_SEARCH_URL,
            headers=headers,
            params=params,
            timeout=aiohttp.ClientTimeout(total=8),
        ) as resp:
            if resp.status != 200:
                return None
            data = await resp.json()
            foods = data.get("foods", [])
            if not foods:
                return None
            return _normalize_nutritionix(foods[0])


def _normalize_nutritionix(raw: dict) -> dict[str, Any]:
    return {
        "barcode": raw.get("upc", ""),
        "product_name": raw.get("food_name", "Unknown Product"),
        "brand": raw.get("brand_name", ""),
        "image_url": raw.get("photo", {}).get("thumb", ""),
        "ingredients_text": raw.get("nf_ingredient_statement", ""),
        "allergens": [],
        "labels": [],
        "categories": [],
        "quantity": f"{raw.get('serving_qty', '')} {raw.get('serving_unit', '')}",
        "serving_size": raw.get("serving_weight_grams", ""),
        "nutriscore_grade": "",
        "nutrient_levels": {
            "energy_100g":        raw.get("nf_calories", 0),
            "fat_100g":           raw.get("nf_total_fat", 0),
            "saturated-fat_100g": raw.get("nf_saturated_fat", 0),
            "trans-fat_100g":     raw.get("nf_trans_fatty_acid", 0),
            "carbohydrates_100g": raw.get("nf_total_carbohydrate", 0),
            "sugars_100g":        raw.get("nf_sugars", 0),
            "fiber_100g":         raw.get("nf_dietary_fiber", 0),
            "proteins_100g":      raw.get("nf_protein", 0),
            "sodium_100g":        raw.get("nf_sodium", 0),
            "potassium_100g":     raw.get("nf_potassium", 0),
            "phosphorus_100g":    raw.get("nf_p", 0),
        },
        "source": "nutritionix",
    }


async def lookup_product(barcode: str) -> dict[str, Any] | None:
    """
    Try OpenFoodFacts first, then fall back to Nutritionix.
    Returns normalized product dict or None if not found.
    """
    product = await _fetch_openfoodfacts(barcode)
    if product:
        return product
    product = await _fetch_nutritionix(barcode)
    return product
