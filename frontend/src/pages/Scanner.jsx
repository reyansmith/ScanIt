import { useState } from 'react';
import { Barcode, Check, ChevronDown, ChevronRight, CircleAlert, Info, ScanLine, ShoppingCart, Sparkles, Upload } from 'lucide-react';
import AppShell from '../components/AppShell';

const ingredients = [
  { name: 'Whole grains', detail: 'Contains whole grain oats, wheat and barley', status: 'positive' },
  { name: 'Added sugars', detail: 'Moderate amount (9g per serving)', status: 'positive' },
  { name: 'Sodium', detail: '230mg per serving (relatively high for your low-sodium preference)', status: 'caution', expandable: true },
  { name: 'Allergens', detail: 'No major allergens detected', status: 'positive' },
  { name: 'Other', detail: 'No concerning additives detected', status: 'positive' },
];

const alternatives = [
  { name: 'Oat & Seed Crunch', score: 92, label: 'Excellent Match', note: 'Higher in fiber, lower sodium', image: '/assets/oat-seed-crunch.png' },
  { name: 'Simple Grain Flakes', score: 88, label: 'Great Match', note: 'Lower sodium, similar taste', image: '/assets/simple-grain-flakes.png' },
];

export default function Scanner() {
  const [expandedIngredient, setExpandedIngredient] = useState('');
  const [toast, setToast] = useState('');
  const [scanOpen, setScanOpen] = useState(false);
  const [scanQuery, setScanQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const analyze = (event) => {
    event.preventDefault();
    if (!scanQuery.trim()) return;
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setScanOpen(false);
      notify(`Analysis ready for ${scanQuery.trim()}.`);
      setScanQuery('');
    }, 850);
  };

  return (
    <AppShell onDemoNavigate={notify}>
      <main className="analysis-page">
        <div className="analysis-toolbar">
          <button className="back-link" onClick={() => notify('Returned to search results.')}><span aria-hidden="true">←</span> Back to results</button>
          <span className="scan-date"><Barcode size={16} /> Scanned on Sep 27, 2026</span>
        </div>

        <section className="analysis-hero" aria-labelledby="product-title">
          <div className="product-identity">
            <img className="product-image" src="/assets/whole-grain-cereal.png" alt="Harvest & Co. Whole Grain Cereal package" />
            <div className="product-copy">
              <p className="product-brand">Harvest &amp; Co.</p>
              <h1 id="product-title">Whole Grain Cereal</h1>
              <p className="product-description">A hearty blend of whole grains for everyday energy.</p>
              <div className="nutrition-highlights" aria-label="Nutrition highlights">
                <div><strong>45g</strong><span>Serving size</span></div>
                <div><strong>6g</strong><span>Fiber<br />(24% DV)</span></div>
                <div><strong>9g</strong><span>Total sugar<br />per serving</span></div>
              </div>
              <div className="product-tags"><span>Whole Grains</span><span>Good Source of Fiber</span><span>No Detected Allergens</span></div>
            </div>
          </div>

          <aside className="score-panel" aria-label="Personalized compatibility score">
            <div className="score-summary">
              <div className="score-ring" aria-label="82 out of 100"><strong>82</strong><span>/100</span></div>
              <div><h2>Good Match</h2><p>How well this product fits<br />your current profile.</p></div>
            </div>
            <p className="score-explanation">This product aligns well with your health preferences, with a few areas to keep in mind.</p>
            <div className="score-actions">
              <button className="button primary" onClick={() => setScanOpen(true)}><ScanLine size={19} /> Scan another product</button>
              <button className="button secondary" onClick={() => notify('Whole Grain Cereal added to your shopping list.')}><ShoppingCart size={19} /> Add to shopping list</button>
              <button className="button secondary" onClick={() => document.getElementById('alternatives')?.scrollIntoView({ behavior: 'smooth' })}>⇄ <span>Compare</span></button>
            </div>
          </aside>
        </section>

        <section className="match-reasons" aria-label="Compatibility explanation">
          <div className="reason-block positive"><span className="reason-icon"><Check size={23} /></span><div><h2>Why this is a good match</h2><ul><li>High in fiber, which supports your digestive health goals</li><li>Made with whole grains and simple ingredients</li><li>No detected allergens based on your profile</li><li>Fits well with your preference for lower added sugars</li></ul></div></div>
          <div className="reason-block caution"><span className="reason-icon"><CircleAlert size={23} /></span><div><h2>Things to watch</h2><ul><li>Sodium is relatively high for your low-sodium preference.</li></ul><p>This doesn’t mean you can’t enjoy it — consider smaller portions or less frequent consumption.</p></div></div>
        </section>

        <div className="analysis-body">
          <div className="primary-content">
            <section className="ingredient-section" aria-labelledby="ingredient-heading">
              <div className="section-heading-row"><div><h2 id="ingredient-heading">Ingredient Check</h2><p>We analyzed ingredients against your health profile and preferences.</p></div><button onClick={() => notify('All ingredient details expanded.')}>View all ingredients <ChevronDown size={15} /></button></div>
              <div className="ingredient-list">
                {ingredients.map((ingredient) => {
                  const open = expandedIngredient === ingredient.name;
                  return <div className={`ingredient-row-wrap ${open ? 'open' : ''}`} key={ingredient.name}>
                    <button className="ingredient-row" onClick={() => ingredient.expandable && setExpandedIngredient(open ? '' : ingredient.name)} aria-expanded={ingredient.expandable ? open : undefined}>
                      <span className={`status-icon ${ingredient.status}`}>{ingredient.status === 'caution' ? '!' : <Check size={14} />}</span><strong>{ingredient.name}</strong><span>{ingredient.detail}</span>{ingredient.expandable ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                    </button>
                    {open && <div className="ingredient-detail"><strong>Why ScanIt flagged this</strong><p>Your profile includes a lower-sodium preference. At 230mg per serving, this product is above the 180mg target you set for breakfast foods.</p></div>}
                  </div>;
                })}
              </div>
            </section>

            <section id="alternatives" className="alternatives-section" aria-labelledby="alternative-heading">
              <div className="section-heading-row"><div><h2 id="alternative-heading">Healthier Alternatives</h2><p>Similar products that may be a better fit for your profile.</p></div><button onClick={() => notify('Showing more better-match options.')}>View more options <span aria-hidden="true">→</span></button></div>
              <div className="alternative-grid">
                {alternatives.map((item) => <article className="alternative-card" key={item.name}>
                  <img src={item.image} alt={`${item.name} package`} />
                  <div className="alternative-info"><small>Harvest &amp; Co.</small><h3>{item.name}</h3><p>{item.note}</p></div>
                  <div className="mini-score"><div className="mini-score-ring"><strong>{item.score}</strong><span>/100</span></div><small>{item.label}</small></div>
                  <div className="alternative-actions"><button onClick={() => notify(`${item.name} opened.`)}>View Product</button><button onClick={() => notify(`Comparing Whole Grain Cereal with ${item.name}.`)}>Compare</button></div>
                </article>)}
              </div>
            </section>
          </div>

          <aside className="ai-insight"><div className="ai-label"><Sparkles size={18} /> AI Insight</div><p>This is a solid everyday cereal choice for your profile. If you’re watching sodium, try pairing it with low-sodium milk or a fresh fruit topping.</p><button onClick={() => notify('Ask ScanIt is ready for your question.')}>Ask ScanIt <span>→</span></button></aside>
        </div>
        <footer className="medical-disclaimer"><Info size={15} /> UI demonstration, not medical advice. Always consult a healthcare professional for personalized guidance.</footer>
      </main>

      {scanOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setScanOpen(false)}><section className="scan-modal" role="dialog" aria-modal="true" aria-labelledby="scan-modal-title"><button className="modal-close" onClick={() => setScanOpen(false)} aria-label="Close">×</button><span className="scan-modal-icon"><ScanLine size={26} /></span><h2 id="scan-modal-title">What are you eating today?</h2><p>Search for a product or upload a clear photo of its label.</p><form onSubmit={analyze}><label htmlFor="product-search">Product name</label><input id="product-search" autoFocus value={scanQuery} onChange={(event) => setScanQuery(event.target.value)} placeholder="Search a product…" /><div className="modal-actions"><button type="button" className="button secondary" onClick={() => notify('Image upload is ready for a product photo.')}><Upload size={18} /> Upload Image</button><button className="button primary" disabled={!scanQuery.trim() || loading}>{loading ? 'Analyzing…' : 'Analyze product'}</button></div></form></section></div>}
      {toast && <div className="toast" role="status"><Check size={17} /> {toast}</div>}
    </AppShell>
  );
}
