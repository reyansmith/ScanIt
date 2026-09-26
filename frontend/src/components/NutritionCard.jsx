const NUTRIENT_LABELS = {
  energy_100g: ['Calories', 'kcal'],
  fat_100g: ['Total Fat', 'g'],
  'saturated-fat_100g': ['Saturated Fat', 'g'],
  'trans-fat_100g': ['Trans Fat', 'g'],
  carbohydrates_100g: ['Carbohydrates', 'g'],
  sugars_100g: ['Sugars', 'g'],
  fiber_100g: ['Dietary Fiber', 'g'],
  proteins_100g: ['Protein', 'g'],
  sodium_100g: ['Sodium', 'mg'],
  potassium_100g: ['Potassium', 'mg'],
};

export default function NutritionCard({ product, flags = [] }) {
  if (!product) return null;
  const nl = product.nutrient_levels || {};
  const flaggedReasons = flags.map((f) => f.reason);

  return (
    <div className="card fade-in">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem', alignItems: 'flex-start' }}>
        {product.image_url && (
          <img src={product.image_url} alt={product.product_name} style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--border)' }} />
        )}
        <div>
          <h3 style={{ marginBottom: '.2rem' }}>{product.product_name || 'Unknown Product'}</h3>
          {product.brand && <p style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>{product.brand}</p>}
          {product.nutriscore_grade && (
            <span style={{ marginTop: '.4rem', display: 'inline-block', background: 'var(--teal-bg)', color: 'var(--teal)', padding: '.2rem .6rem', borderRadius: 4, fontSize: '.75rem', fontWeight: 700 }}>
              Nutri-Score {product.nutriscore_grade}
            </span>
          )}
        </div>
      </div>

      <p style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>
        Nutritional Info (per 100g)
      </p>
      <table className="nutrition-table">
        <thead>
          <tr><th>Nutrient</th><th>Amount</th></tr>
        </thead>
        <tbody>
          {Object.entries(NUTRIENT_LABELS).map(([key, [label, unit]]) => {
            const val = nl[key];
            if (val == null || val === 0) return null;
            const isFlagged = flaggedReasons.some((r) =>
              r.toLowerCase().includes(label.toLowerCase().split(' ').pop())
            );
            return (
              <tr key={key} className={isFlagged ? 'flag-row' : ''}>
                <td>{label} {isFlagged && '⚠️'}</td>
                <td className="mono">{Number(val).toFixed(1)} {unit}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {product.ingredients_text && (
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', fontSize: '.85rem', fontWeight: 600, color: 'var(--slate-dark)' }}>
            Ingredients
          </summary>
          <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginTop: '.5rem', lineHeight: 1.6 }}>
            {product.ingredients_text}
          </p>
        </details>
      )}
    </div>
  );
}
