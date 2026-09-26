import Groq from 'groq-sdk';
import { config } from '../config.js';

export const SYSTEM_TEMPLATE = `You are MediBot, a knowledgeable, empathetic, and scientifically rigorous health assistant embedded in the MediScan platform.

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

Respond in 2-4 sentences unless a detailed breakdown is explicitly requested.`;

function nutritionalSummary(levels = {}) {
  const labels = {
    energy_100g: ['Energy', 'kcal'], fat_100g: ['Total Fat', 'g'],
    'saturated-fat_100g': ['Saturated Fat', 'g'], carbohydrates_100g: ['Carbohydrates', 'g'],
    sugars_100g: ['Sugars', 'g'], proteins_100g: ['Protein', 'g'],
    sodium_100g: ['Sodium', 'mg'], fiber_100g: ['Fiber', 'g'],
  };
  const lines = Object.entries(labels).flatMap(([key, [label, unit]]) => {
    const value = Number(levels[key] ?? 0);
    return value ? [`  - ${label}: ${value.toFixed(1)}${unit}`] : [];
  });
  return lines.join('\n') || '  - Not available';
}

function flagsSummary(flags = []) {
  if (!flags.length) return 'No flags — product appears safe for your conditions.';
  return flags.map((flag) => flag.value !== null && flag.value !== undefined
    ? `${flag.reason} (${Number(flag.value).toFixed(1)}${flag.unit ?? ''} > limit ${flag.threshold ?? ''})`
    : `${flag.reason} (contains '${flag.keyword ?? ''}')`).join('; ');
}

export function buildSystemPrompt(product, profile) {
  const replacements = {
    conditions: profile.health_conditions?.join(', ') || 'None specified', age: profile.age ?? 'N/A',
    weight_kg: profile.weight_kg ?? 'N/A', height_cm: profile.height_cm ?? 'N/A',
    activity_level: profile.activity_level ?? 'N/A', product_name: product.product_name ?? 'Unknown',
    brand: product.brand ?? '', verdict: product.verdict ?? 'UNKNOWN',
    flags_summary: flagsSummary(product.flags ?? []),
    ingredients_text: (product.ingredients_text ?? 'Not available').slice(0, 500),
    nutritional_data: nutritionalSummary(product.nutrient_levels ?? {}),
  };
  return Object.entries(replacements).reduce(
    (prompt, [key, value]) => prompt.replace(`{${key}}`, String(value)), SYSTEM_TEMPLATE,
  );
}

export async function streamMedibotResponse({ message, productContext, profileContext, chatHistory }) {
  const groq = new Groq({ apiKey: config.groqApiKey });
  const messages = [{ role: 'system', content: buildSystemPrompt(productContext, profileContext) }];
  for (const item of (chatHistory ?? []).slice(-6)) {
    if (item.role === 'user') messages.push({ role: 'user', content: item.content });
  }
  messages.push({ role: 'user', content: message });
  return groq.chat.completions.create({
    model: config.groqModel,
    messages,
    temperature: 0.4,
    stream: true,
  });
}

export function buildFallbackResponse(product, profile) {
  const productName = product.product_name;
  const { brand, verdict } = product;
  const flags = product.flags ?? [];
  const alertSummaries = product.alert_summaries ?? [];
  const conditions = profile.health_conditions ?? [];
  if (productName && verdict) {
    const badge = verdict === 'SAFE' ? '🟢 Safe' : (verdict === 'CAUTION' ? '🟡 Caution' : '🔴 Danger');
    const item = `**Scanned Item:** ${productName}${brand ? ` (${brand})` : ''}`;
    let analysis = '✅ **Status:** No ingredient or nutritional risks detected for your profile conditions!';
    if (alertSummaries.length || flags.length) {
      const items = alertSummaries.length ? alertSummaries : flags.map((flag) => `[${flag.condition ?? 'General'}] ${flag.reason ?? 'Flagged'}`);
      analysis = `**Flagged Warnings:**\n${items.map((warning) => `• ${warning}`).join('\n')}`;
    }
    return `Hi! I'm MediBot 🩺\n\n${item}\n**Verdict:** ${badge}\n\n${analysis}\n\n💡 *Tip: Check the Community page for safe alternative recipes and products!*`;
  }
  const conditionText = conditions.length
    ? `I'm ready to check items for your profile (${conditions.join(', ')}).`
    : 'Visit Profile Setup to set your health conditions!';
  return `Hi! I'm MediBot 🩺\n\nTo evaluate a product or suggest safer alternatives, please scan a product barcode first in the **Scanner** tab!\n\nOnce scanned, I will audit its ingredients and nutrients for you. ${conditionText}`;
}
