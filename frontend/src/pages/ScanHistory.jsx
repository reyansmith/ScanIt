import { useMemo, useState } from 'react';
import { CalendarDays, Camera, ChevronRight, Filter, Search, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import StatusPill from '../components/StatusPill';

const history = [
  { name: 'Oat & Seed Crunch', brand: 'Harvest & Co.', date: 'Today · 10:32 AM', category: 'Breakfast', score: 92, status: 'suitable', label: 'Excellent Match', reason: 'Low sodium · High fiber', image: '/assets/oat-seed-crunch.png' },
  { name: 'Whole Grain Cereal', brand: 'Harvest & Co.', date: 'Yesterday · 4:18 PM', category: 'Breakfast', score: 82, status: 'suitable', label: 'Good Match', reason: 'High fiber · Sodium to watch', image: '/assets/whole-grain-cereal.png' },
  { name: 'Chocolate Breakfast Cereal', brand: 'Morning Box', date: 'Sep 25 · 8:04 AM', category: 'Breakfast', score: 42, status: 'flagged', label: 'Flagged', reason: 'High added sugar', image: '/assets/simple-grain-flakes.png' },
  { name: 'Simple Grain Flakes', brand: 'Harvest & Co.', date: 'Sep 24 · 7:46 AM', category: 'Breakfast', score: 88, status: 'suitable', label: 'Great Match', reason: 'Lower sodium · Simple ingredients', image: '/assets/simple-grain-flakes.png' },
  { name: 'Salted Nut Bar', brand: 'Trail Good', date: 'Sep 22 · 3:15 PM', category: 'Snacks', score: 64, status: 'caution', label: 'Caution', reason: 'Sodium above preference' },
  { name: 'Greek Yogurt', brand: 'Meadow Daily', date: 'Sep 20 · 9:12 AM', category: 'Dairy', score: 91, status: 'suitable', label: 'Good Match', reason: 'High protein · Low added sugar' },
];

export default function ScanHistory() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const filtered = useMemo(() => history.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) && (filter === 'all' || item.status === filter)), [query, filter]);

  return (
    <PageShell title="Scan History" subtitle="Every product you’ve checked, with the context that mattered." action={<Link className="button primary" to="/scanner"><Camera size={18} /> Scan Product</Link>}>
      {({ notify }) => <>
        <section className="history-toolbar surface-panel">
          <div className="history-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product name…" aria-label="Search scan history" /></div>
          <div className="history-filters" aria-label="Filter scan history">{[['all','All'],['suitable','Suitable'],['caution','Caution'],['flagged','Flagged']].map(([value,label]) => <button className={filter === value ? 'active' : ''} onClick={() => setFilter(value)} key={value}>{label}</button>)}</div>
          <button className="button secondary compact-button" onClick={() => notify('Date and category filters opened.')}><SlidersHorizontal size={16} /> More filters</button>
        </section>

        <section className="surface-panel history-panel">
          <div className="section-title-row compact"><div><h2>{filter === 'all' ? 'All scans' : `${filter[0].toUpperCase()}${filter.slice(1)} scans`}</h2><p>{filtered.length} products · Most recent first</p></div><button className="filter-chip" onClick={() => notify('Date range selector opened.')}><CalendarDays size={15} /> Sep 1–27</button></div>
          <div className="history-table" role="table" aria-label="Scan history">
            <div className="history-table-head" role="row"><span>Product</span><span>Date</span><span>Compatibility</span><span>Status</span><span>Reason</span><span /></div>
            {filtered.map((item) => <Link to="/scanner" className="history-row" role="row" key={`${item.name}-${item.date}`}>
              <div className="history-product">{item.image ? <img src={item.image} alt="" /> : <span className="product-icon"><Filter size={18} /></span>}<div><strong>{item.name}</strong><small>{item.brand} · {item.category}</small></div></div>
              <span className="history-date">{item.date}</span>
              <div className={`history-score ${item.status}`}><strong>{item.score}</strong><span>/100</span></div>
              <StatusPill status={item.status}>{item.label}</StatusPill>
              <span className="history-reason">{item.reason}</span><ChevronRight size={18} />
            </Link>)}
            {filtered.length === 0 && <div className="empty-state"><Search size={28} /><h3>No matching scans</h3><p>Try another product name or remove a filter.</p><button className="button secondary compact-button" onClick={() => { setQuery(''); setFilter('all'); }}>Clear filters</button></div>}
          </div>
        </section>
      </>}
    </PageShell>
  );
}
