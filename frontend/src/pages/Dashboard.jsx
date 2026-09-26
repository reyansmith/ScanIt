import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Camera, CheckCircle2, Clock3, Gauge, Lightbulb, ShieldAlert, TrendingUp } from 'lucide-react';
import PageShell from '../components/PageShell';
import StatusPill from '../components/StatusPill';

const compatibility = [
  { day: 'Mon', score: 74 }, { day: 'Tue', score: 81 }, { day: 'Wed', score: 79 }, { day: 'Thu', score: 86 }, { day: 'Fri', score: 83 }, { day: 'Sat', score: 89 }, { day: 'Sun', score: 87 },
];
const nutrition = [
  { day: 'Mon', sodium: 980, sugar: 22 }, { day: 'Tue', sodium: 840, sugar: 18 }, { day: 'Wed', sodium: 910, sugar: 21 }, { day: 'Thu', sodium: 760, sugar: 17 }, { day: 'Fri', sodium: 720, sugar: 16 }, { day: 'Sat', sodium: 680, sugar: 15 }, { day: 'Sun', sodium: 700, sugar: 14 },
];

const activity = [
  { name: 'Oat & Seed Crunch', time: 'Today · 10:32 AM', score: 92, image: '/assets/oat-seed-crunch.png', status: 'suitable', label: 'Excellent Match' },
  { name: 'Whole Grain Cereal', time: 'Yesterday · 4:18 PM', score: 82, image: '/assets/whole-grain-cereal.png', status: 'suitable', label: 'Good Match' },
  { name: 'Chocolate Breakfast Cereal', time: 'Sep 25 · 8:04 AM', score: 42, status: 'flagged', label: 'Flagged' },
];

export default function Dashboard() {
  return (
    <PageShell title="Dashboard" subtitle="Your personal nutrition patterns, explained clearly." action={<Link className="button primary" to="/scanner"><Camera size={18} /> Scan Product</Link>}>
      {({ notify }) => <>
        <section className="dashboard-metrics" aria-label="Overview metrics">
          <article><span className="metric-icon green"><Camera size={19} /></span><div><p>Products scanned</p><strong>48</strong><small><ArrowUpRight size={13} /> 12 this month</small></div></article>
          <article><span className="metric-icon green"><CheckCircle2 size={19} /></span><div><p>Suitable products</p><strong>36</strong><small><ArrowUpRight size={13} /> 75% of scans</small></div></article>
          <article><span className="metric-icon amber"><ShieldAlert size={19} /></span><div><p>Flagged products</p><strong>5</strong><small className="positive"><ArrowDownRight size={13} /> 2 fewer this week</small></div></article>
          <article><span className="metric-icon violet"><Gauge size={19} /></span><div><p>Average compatibility</p><strong>84</strong><small><ArrowUpRight size={13} /> Up 6 points</small></div></article>
        </section>

        <div className="dashboard-chart-grid">
          <section className="surface-panel chart-panel">
            <div className="section-title-row compact"><div><h2>Compatibility trend</h2><p>Average fit across scanned products</p></div><StatusPill status="suitable">Improving</StatusPill></div>
            <div className="chart-summary"><strong>84</strong><span>7-day average</span><small>+6 vs last week</small></div>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={compatibility} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}><CartesianGrid stroke="#eef1ef" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#738078', fontSize: 11 }} /><YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{ fill: '#87918c', fontSize: 10 }} /><Tooltip contentStyle={{ border: '1px solid #dfe5e2', borderRadius: 8, boxShadow: '0 10px 24px rgba(10,56,42,.1)' }} /><Area type="monotone" dataKey="score" stroke="#13795b" fill="#dcefe7" strokeWidth={2.5} isAnimationActive={false} /></AreaChart>
            </ResponsiveContainer>
          </section>

          <section className="surface-panel chart-panel">
            <div className="section-title-row compact"><div><h2>Nutrition trends</h2><p>Sodium and sugar from scanned products</p></div><button className="filter-chip" onClick={() => notify('Nutrition metric filter opened.')}>Last 7 days</button></div>
            <div className="chart-legend"><span><i className="legend-dot sodium" /> Sodium (mg)</span><span><i className="legend-dot sugar" /> Sugar (g × 30)</span></div>
            <ResponsiveContainer width="100%" height={225}>
              <BarChart data={nutrition} margin={{ top: 8, right: 6, bottom: 0, left: -18 }}><CartesianGrid stroke="#eef1ef" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#738078', fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#87918c', fontSize: 10 }} /><Tooltip contentStyle={{ border: '1px solid #dfe5e2', borderRadius: 8 }} /><Bar dataKey="sodium" fill="#83bda8" radius={[4,4,0,0]} isAnimationActive={false} /><Bar dataKey={(row) => row.sugar * 30} name="Sugar" fill="#d9b36a" radius={[4,4,0,0]} isAnimationActive={false} /></BarChart>
            </ResponsiveContainer>
          </section>
        </div>

        <div className="dashboard-detail-grid">
          <section className="surface-panel flagged-panel">
            <div className="section-title-row compact"><div><h2>Frequently flagged</h2><p>Ingredients to keep an eye on</p></div><AlertTriangle size={20} color="var(--amber-500)" /></div>
            {[['Sodium', '7 products', 72], ['Added sugar', '5 products', 54], ['Saturated fat', '3 products', 34]].map(([name, count, width]) => <div className="flagged-row" key={name}><div><strong>{name}</strong><span>{count}</span></div><div className="flag-bar"><span style={{ width: `${width}%` }} /></div></div>)}
          </section>
          <section className="insight-panel mint dashboard-insight"><span className="insight-icon"><Lightbulb size={21} /></span><div><p className="page-eyebrow">Personalized insight</p><h2>Your sodium trend is moving down.</h2><p>You chose four lower-sodium alternatives this week. Keep comparing similar breakfast products to maintain the pattern.</p><button onClick={() => notify('More personalized insights opened.')}>View all insights</button></div></section>
          <section className="surface-panel activity-panel">
            <div className="section-title-row compact"><div><h2>Recent activity</h2><p>Your latest product checks</p></div><Link className="text-button" to="/history"><Clock3 size={15} /> History</Link></div>
            {activity.map((item) => <Link className="activity-row" to="/scanner" key={item.name}>{item.image ? <img src={item.image} alt="" /> : <span className="product-icon"><AlertTriangle size={18} /></span>}<div><strong>{item.name}</strong><p>{item.time}</p></div><StatusPill status={item.status}>{item.label}</StatusPill><strong className="activity-score">{item.score}</strong></Link>)}
          </section>
        </div>
      </>}
    </PageShell>
  );
}
