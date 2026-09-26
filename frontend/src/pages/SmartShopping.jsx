import { useMemo, useState } from 'react';
import { Check, CirclePlus, ListChecks, Plus, ScanLine, Search, ShoppingCart, Trash2 } from 'lucide-react';
import PageShell from '../components/PageShell';
import StatusPill from '../components/StatusPill';

const initialItems = [
  { id: 1, name: 'Oat & Seed Crunch', note: 'High fiber · 160mg sodium', status: 'suitable', label: 'Excellent Match', checked: true, image: '/assets/oat-seed-crunch.png' },
  { id: 2, name: 'Whole Grain Bread', note: '7g fiber · No added sugar', status: 'suitable', label: 'Good Match', checked: true },
  { id: 3, name: 'Unsalted Peanut Butter', note: 'Good protein · No added sodium', status: 'suitable', label: 'Good Match', checked: false },
  { id: 4, name: 'Almond Milk', note: 'Check added sugar before buying', status: 'caution', label: 'Review', checked: false },
  { id: 5, name: 'Fresh Apples', note: 'Whole food · High fiber', status: 'suitable', label: 'Suitable', checked: false },
];

const recommendations = [
  { name: 'Simple Grain Flakes', note: 'Lower sodium, similar taste', score: 88, image: '/assets/simple-grain-flakes.png' },
  { name: 'Whole Grain Cereal', note: 'High fiber, moderate sugar', score: 82, image: '/assets/whole-grain-cereal.png' },
];

export default function SmartShopping() {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState('');
  const [newItem, setNewItem] = useState('');
  const completed = items.filter((item) => item.checked).length;
  const filtered = useMemo(() => items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [items, search]);

  return (
    <PageShell title="Smart Shopping" subtitle="Build a shopping list that fits your health profile." action={(notify) => <button className="button primary" onClick={() => notify('Shopping mode is ready for quick product checks.')}><ScanLine size={18} /> Scan while shopping</button>}>
      {({ notify }) => <>
        <section className="shopping-summary-bar">
          <div><span className="metric-icon green"><ShoppingCart size={20} /></span><div><strong>{items.length} items</strong><p>On this week’s list</p></div></div>
          <div><span className="metric-icon green"><ListChecks size={20} /></span><div><strong>{completed} ready</strong><p>{Math.round((completed / items.length) * 100)}% complete</p></div></div>
          <div className="shopping-summary-progress"><div><span>Shopping progress</span><strong>{completed}/{items.length}</strong></div><div className="shopping-progress"><span style={{ width: `${(completed / items.length) * 100}%` }} /></div></div>
        </section>

        <div className="shopping-layout">
          <section className="surface-panel shopping-list-panel">
            <div className="section-title-row compact"><div><h2>This week’s shopping</h2><p>Personalized for your lower-sodium and higher-fiber goals</p></div><button className="text-button" onClick={() => setItems(items.map((item) => ({ ...item, checked: true })))}><Check size={15} /> Mark all ready</button></div>
            <form className="shopping-add-row" onSubmit={(event) => { event.preventDefault(); if (!newItem.trim()) return; setItems([...items, { id: Date.now(), name: newItem.trim(), note: 'New item · Needs review', status: 'caution', label: 'Review', checked: false }]); setNewItem(''); notify(`${newItem.trim()} added to your shopping list.`); }}>
              <div className="inline-search"><Plus size={18} /><input value={newItem} onChange={(event) => setNewItem(event.target.value)} placeholder="Add an item…" aria-label="Add shopping item" /></div><button className="button primary compact-button" disabled={!newItem.trim()}>Add item</button>
            </form>
            <div className="list-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this list" aria-label="Search shopping list" /></div>
            <div className="shopping-list">
              {filtered.map((item) => <div className={`shopping-row ${item.checked ? 'checked' : ''}`} key={item.id}>
                <button className="shopping-check" aria-label={`${item.checked ? 'Uncheck' : 'Check'} ${item.name}`} onClick={() => setItems(items.map((candidate) => candidate.id === item.id ? { ...candidate, checked: !candidate.checked } : candidate))}>{item.checked && <Check size={16} />}</button>
                {item.image ? <img src={item.image} alt="" /> : <span className="product-icon"><ShoppingCart size={19} /></span>}
                <div><strong>{item.name}</strong><p>{item.note}</p></div>
                <StatusPill status={item.status}>{item.label}</StatusPill>
                <button className="row-icon-button" aria-label={`Remove ${item.name}`} onClick={() => { setItems(items.filter((candidate) => candidate.id !== item.id)); notify(`${item.name} removed.`); }}><Trash2 size={17} /></button>
              </div>)}
            </div>
          </section>

          <aside className="shopping-recommendations">
            <section className="surface-panel">
              <div className="section-title-row compact"><div><h2>Recommended products</h2><p>Better matches for this list</p></div><CirclePlus size={21} color="var(--green-700)" /></div>
              <div className="recommendation-stack">
                {recommendations.map((product) => <article key={product.name}><img src={product.image} alt={`${product.name} package`} /><div><div className="inline-score"><strong>{product.score}</strong><span>/100</span></div><h3>{product.name}</h3><p>{product.note}</p><button onClick={() => { if (!items.some((item) => item.name === product.name)) setItems([...items, { id: Date.now(), name: product.name, note: product.note, status: 'suitable', label: 'Good Match', checked: false, image: product.image }]); notify(`${product.name} added.`); }}><Plus size={15} /> Add to list</button></div></article>)}
              </div>
            </section>
            <section className="insight-panel mint compact-insight"><span className="insight-icon"><ScanLine size={20} /></span><div><p className="page-eyebrow">Shopping mode</p><h2>Check products in seconds</h2><p>Scan a package while you shop to see Suitable, Caution, or Avoid for your profile.</p><button onClick={() => notify('Shopping scanner opened.')}>Start scanning</button></div></section>
          </aside>
        </div>
      </>}
    </PageShell>
  );
}
