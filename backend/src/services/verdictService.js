export const HEALTH_RULES = {
  'Type 1 Diabetes': [
    { nutrient: 'sugars_100g', threshold: 5, unit: 'g', label: 'High Sugar' },
    { nutrient: 'carbohydrates_100g', threshold: 20, unit: 'g', label: 'High Carbohydrates' },
  ],
  'Type 2 Diabetes': [
    { nutrient: 'sugars_100g', threshold: 5, unit: 'g', label: 'High Sugar' },
    { nutrient: 'carbohydrates_100g', threshold: 20, unit: 'g', label: 'High Carbohydrates' },
  ],
  'Hypertension (High Blood Pressure)': [
    { nutrient: 'sodium_100g', threshold: 120, unit: 'mg', label: 'High Sodium' },
  ],
  'Hypercholesterolemia (High Cholesterol)': [
    { nutrient: 'saturated-fat_100g', threshold: 2, unit: 'g', label: 'High Saturated Fat' },
    { nutrient: 'trans-fat_100g', threshold: 0, unit: 'g', label: 'Contains Trans Fat' },
  ],
  'Chronic Kidney Disease (CKD)': [
    { nutrient: 'potassium_100g', threshold: 200, unit: 'mg', label: 'High Potassium' },
    { nutrient: 'phosphorus_100g', threshold: 100, unit: 'mg', label: 'High Phosphorus' },
    { nutrient: 'proteins_100g', threshold: 10, unit: 'g', label: 'High Protein' },
  ],
  'Celiac Disease': [
    { ingredient_contains: ['wheat', 'gluten', 'barley', 'rye', 'spelt', 'triticale'], label: 'Contains Gluten' },
  ],
  'Nut Allergy (General)': [
    { ingredient_contains: ['peanut', 'almond', 'walnut', 'cashew', 'hazelnut', 'pecan', 'pistachio', 'macadamia', 'brazil nut'], label: 'Contains Nuts' },
  ],
  'Dairy Allergy': [
    { ingredient_contains: ['milk', 'lactose', 'casein', 'whey', 'butter', 'cream', 'cheese', 'yogurt', 'ghee'], label: 'Contains Dairy' },
  ],
  'IBS/FODMAP Sensitivity': [
    { ingredient_contains: ['fructose', 'high fructose', 'lactose', 'sorbitol', 'mannitol', 'xylitol', 'inulin', 'fructooligosaccharide', 'chicory root', 'apple juice concentrate'], label: 'High FODMAP Ingredients' },
  ],
};

const HARD_DANGER_LABELS = new Set(['Contains Gluten', 'Contains Nuts', 'Contains Dairy']);

export function computeVerdict(product, conditions) {
  const flags = [];
  const nutrients = product.nutrient_levels ?? {};
  const ingredients = (product.ingredients_text ?? '').toLowerCase();

  for (const condition of conditions) {
    for (const rule of HEALTH_RULES[condition] ?? []) {
      if (rule.nutrient) {
        const value = Number(nutrients[rule.nutrient] ?? 0) || 0;
        if (value > rule.threshold) {
          flags.push({ condition, reason: rule.label, value, threshold: rule.threshold, unit: rule.unit, keyword: null });
        }
      } else {
        const keyword = rule.ingredient_contains.find((candidate) => ingredients.includes(candidate));
        if (keyword) {
          flags.push({ condition, reason: rule.label, value: null, threshold: null, unit: null, keyword });
        }
      }
    }
  }

  let verdict = 'SAFE';
  if (flags.some((flag) => HARD_DANGER_LABELS.has(flag.reason)) || flags.length >= 3) verdict = 'DANGER';
  else if (flags.length) verdict = 'CAUTION';
  return { verdict, flags };
}

export function buildAlertSummary(flags) {
  return flags.map((flag) => flag.value !== null
    ? `[${flag.condition}] ${flag.reason}: ${flag.value.toFixed(1)}${flag.unit} (limit: ${flag.threshold}${flag.unit})`
    : `[${flag.condition}] ${flag.reason} — contains '${flag.keyword}'`);
}
