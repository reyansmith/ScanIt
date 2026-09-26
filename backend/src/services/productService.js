import { config } from '../config.js';

const OPEN_FOOD_FACTS_URL = 'https://world.openfoodfacts.org/api/v2/product/{barcode}.json';
const NUTRITIONIX_SEARCH_URL = 'https://trackapi.nutritionix.com/v2/search/item';

const numeric = (value) => Number(value ?? 0) || 0;

export function normalizeOpenFoodFacts(raw) {
  const nutrients = raw.nutriments ?? {};
  return {
    barcode: raw.code ?? '',
    product_name: raw.product_name ?? 'Unknown Product',
    brand: raw.brands ?? '',
    image_url: raw.image_front_url ?? '',
    ingredients_text: raw.ingredients_text_en || raw.ingredients_text || '',
    allergens: raw.allergens_tags ?? [],
    labels: raw.labels_tags ?? [],
    categories: raw.categories_tags ?? [],
    quantity: raw.quantity ?? '',
    serving_size: raw.serving_size ?? '',
    nutriscore_grade: (raw.nutriscore_grade ?? '').toUpperCase(),
    nutrient_levels: {
      energy_100g: numeric(nutrients['energy-kcal_100g']),
      fat_100g: numeric(nutrients.fat_100g),
      'saturated-fat_100g': numeric(nutrients['saturated-fat_100g']),
      'trans-fat_100g': numeric(nutrients['trans-fat_100g']),
      carbohydrates_100g: numeric(nutrients.carbohydrates_100g),
      sugars_100g: numeric(nutrients.sugars_100g),
      fiber_100g: numeric(nutrients.fiber_100g),
      proteins_100g: numeric(nutrients.proteins_100g),
      sodium_100g: numeric(nutrients.sodium_100g) * 1000,
      salt_100g: numeric(nutrients.salt_100g),
      potassium_100g: numeric(nutrients.potassium_100g),
      phosphorus_100g: numeric(nutrients.phosphorus_100g),
    },
    source: 'openfoodfacts',
  };
}

export function normalizeNutritionix(raw) {
  return {
    barcode: raw.upc ?? '', product_name: raw.food_name ?? 'Unknown Product', brand: raw.brand_name ?? '',
    image_url: raw.photo?.thumb ?? '', ingredients_text: raw.nf_ingredient_statement ?? '',
    allergens: [], labels: [], categories: [], quantity: `${raw.serving_qty ?? ''} ${raw.serving_unit ?? ''}`,
    serving_size: raw.serving_weight_grams ?? '', nutriscore_grade: '',
    nutrient_levels: {
      energy_100g: numeric(raw.nf_calories), fat_100g: numeric(raw.nf_total_fat),
      'saturated-fat_100g': numeric(raw.nf_saturated_fat), 'trans-fat_100g': numeric(raw.nf_trans_fatty_acid),
      carbohydrates_100g: numeric(raw.nf_total_carbohydrate), sugars_100g: numeric(raw.nf_sugars),
      fiber_100g: numeric(raw.nf_dietary_fiber), proteins_100g: numeric(raw.nf_protein),
      sodium_100g: numeric(raw.nf_sodium), potassium_100g: numeric(raw.nf_potassium),
      phosphorus_100g: numeric(raw.nf_p),
    },
    source: 'nutritionix',
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(8000) });
  if (!response.ok) return null;
  return response.json();
}

async function fetchOpenFoodFacts(barcode) {
  const data = await fetchJson(OPEN_FOOD_FACTS_URL.replace('{barcode}', encodeURIComponent(barcode)));
  return data?.status === 1 ? normalizeOpenFoodFacts(data.product) : null;
}

async function fetchNutritionix(barcode) {
  if (!config.nutritionixAppId || !config.nutritionixApiKey) return null;
  const url = new URL(NUTRITIONIX_SEARCH_URL);
  url.searchParams.set('upc', barcode);
  const data = await fetchJson(url, { headers: {
    'x-app-id': config.nutritionixAppId,
    'x-app-key': config.nutritionixApiKey,
    'Content-Type': 'application/json',
  } });
  return data?.foods?.length ? normalizeNutritionix(data.foods[0]) : null;
}

export async function lookupProduct(barcode) {
  return (await fetchOpenFoodFacts(barcode)) ?? fetchNutritionix(barcode);
}
