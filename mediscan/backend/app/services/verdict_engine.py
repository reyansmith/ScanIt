"""
MediVerdict Engine — Rule-based health analysis.
Cross-references product nutritional data and ingredients against
a user's health conditions to produce a SAFE / CAUTION / DANGER verdict.
"""

from typing import Any

# ── Rule Definitions ────────────────────────────────────────────────────────
# Each rule is either:
#   nutrient rule  → {"nutrient": str, "threshold": float, "unit": str, "label": str}
#   ingredient rule → {"ingredient_contains": list[str], "label": str}

HEALTH_RULES: dict[str, list[dict]] = {
    "Type 1 Diabetes": [
        {"nutrient": "sugars_100g",       "threshold": 5,  "unit": "g",  "label": "High Sugar"},
        {"nutrient": "carbohydrates_100g","threshold": 20, "unit": "g",  "label": "High Carbohydrates"},
    ],
    "Type 2 Diabetes": [
        {"nutrient": "sugars_100g",       "threshold": 5,  "unit": "g",  "label": "High Sugar"},
        {"nutrient": "carbohydrates_100g","threshold": 20, "unit": "g",  "label": "High Carbohydrates"},
    ],
    "Hypertension (High Blood Pressure)": [
        {"nutrient": "sodium_100g",       "threshold": 120,"unit": "mg", "label": "High Sodium"},
    ],
    "Hypercholesterolemia (High Cholesterol)": [
        {"nutrient": "saturated-fat_100g","threshold": 2,  "unit": "g",  "label": "High Saturated Fat"},
        {"nutrient": "trans-fat_100g",    "threshold": 0,  "unit": "g",  "label": "Contains Trans Fat"},
    ],
    "Chronic Kidney Disease (CKD)": [
        {"nutrient": "potassium_100g",    "threshold": 200,"unit": "mg", "label": "High Potassium"},
        {"nutrient": "phosphorus_100g",   "threshold": 100,"unit": "mg", "label": "High Phosphorus"},
        {"nutrient": "proteins_100g",     "threshold": 10, "unit": "g",  "label": "High Protein"},
    ],
    "Celiac Disease": [
        {"ingredient_contains": ["wheat","gluten","barley","rye","spelt","triticale"],
         "label": "Contains Gluten"},
    ],
    "Nut Allergy (General)": [
        {"ingredient_contains": ["peanut","almond","walnut","cashew","hazelnut",
                                  "pecan","pistachio","macadamia","brazil nut"],
         "label": "Contains Nuts"},
    ],
    "Dairy Allergy": [
        {"ingredient_contains": ["milk","lactose","casein","whey","butter",
                                  "cream","cheese","yogurt","ghee"],
         "label": "Contains Dairy"},
    ],
    "IBS/FODMAP Sensitivity": [
        {"ingredient_contains": ["fructose","high fructose","lactose","sorbitol",
                                  "mannitol","xylitol","inulin","fructooligosaccharide",
                                  "chicory root","apple juice concentrate"],
         "label": "High FODMAP Ingredients"},
    ],
}

# Labels that are immediately DANGER regardless of count
HARD_DANGER_LABELS = {
    "Contains Gluten",
    "Contains Nuts",
    "Contains Dairy",
}

def compute_verdict(product: dict[str, Any], conditions: list[str]) -> dict[str, Any]:
    """
    Args:
        product: Normalized product dict with keys:
            - nutrient_levels: dict of nutrient → float value
            - ingredients_text: str
        conditions: User's selected health conditions

    Returns:
        {
            "verdict": "SAFE" | "CAUTION" | "DANGER",
            "flags": [
                {
                    "condition": str,
                    "reason": str,
                    "value": float | None,
                    "threshold": float | None,
                    "unit": str | None,
                    "keyword": str | None,
                }
            ]
        }
    """
    flags: list[dict] = []
    nutrients = product.get("nutrient_levels", {})
    ingredients_text = (product.get("ingredients_text") or "").lower()

    for condition in conditions:
        for rule in HEALTH_RULES.get(condition, []):
            if "nutrient" in rule:
                value = float(nutrients.get(rule["nutrient"], 0) or 0)
                if value > rule["threshold"]:
                    flags.append({
                        "condition": condition,
                        "reason": rule["label"],
                        "value": value,
                        "threshold": rule["threshold"],
                        "unit": rule["unit"],
                        "keyword": None,
                    })

            elif "ingredient_contains" in rule:
                for keyword in rule["ingredient_contains"]:
                    if keyword in ingredients_text:
                        flags.append({
                            "condition": condition,
                            "reason": rule["label"],
                            "value": None,
                            "threshold": None,
                            "unit": None,
                            "keyword": keyword,
                        })
                        break  # Only one flag per ingredient rule per condition

    # ── Verdict decision ────────────────────────────────────────────────────
    if not flags:
        verdict = "SAFE"
    elif any(f["reason"] in HARD_DANGER_LABELS for f in flags):
        verdict = "DANGER"
    elif len(flags) >= 3:
        verdict = "DANGER"
    else:
        verdict = "CAUTION"

    return {"verdict": verdict, "flags": flags}


def build_alert_summary(flags: list[dict]) -> list[str]:
    """Convert raw flags into human-readable alert strings for the Dashboard."""
    summaries = []
    for f in flags:
        if f["value"] is not None:
            summaries.append(
                f"[{f['condition']}] {f['reason']}: "
                f"{f['value']:.1f}{f['unit']} (limit: {f['threshold']}{f['unit']})"
            )
        else:
            summaries.append(
                f"[{f['condition']}] {f['reason']} — contains '{f['keyword']}'"
            )
    return summaries
