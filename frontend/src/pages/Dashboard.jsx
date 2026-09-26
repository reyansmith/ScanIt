import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertTriangle, ShieldAlert, Camera, Bell, TrendingUp, Clock, ShoppingBag, Loader2 } from 'lucide-react';
import api from '../api/client';
import Navbar from '../components/Navbar';

const VERDICT_ICON = { 
  SAFE: <CheckCircle size={16} strokeWidth={2.5} />, 
  CAUTION: <AlertTriangle size={16} strokeWidth={2.5} />, 
  DANGER: <ShieldAlert size={16} strokeWidth={2.5} /> 
};

// Mock weekly chart data — replace with real API data
const mockWeekly = [
  { day: 'Mon', sodium: 890, sugar: 18 },
  { day: 'Tue', sodium: 1200, sugar: 22 },
  { day: 'Wed', sodium: 670, sugar: 14 },
  { day: 'Thu', sodium: 1450, sugar: 28 },
  { day: 'Fri', sodium: 980, sugar: 20 },
  { day: 'Sat', sodium: 540, sugar: 11 },
  { day: 'Sun', sodium: 760, sugar: 16 },
];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get('/api/dashboard/summary'), api.get('/api/dashboard/progress')])
      .then(([s, p]) => { setSummary(s.data); setProgress(p.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page"><Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '0.5rem' }}>
        <Loader2 className="spin" size={20} color="var(--text-muted)" />
        <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem' }}>Health Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>Your personal nutrition intelligence hub</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/scanner')}>
            <Camera size={18} /> Scan Product
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Total Scans', value: summary?.total_scans ?? 0 },
            { label: 'Safe Products', value: summary?.safe_scans ?? 0, color: 'var(--safe)' },
            { label: 'Flagged Products', value: summary?.danger_scans ?? 0, color: 'var(--danger)' },
            { label: 'Safe Rate', value: `${progress?.safe_pct ?? 0}%`, color: 'var(--teal)' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-value" style={{ color: s.color || 'var(--teal)' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* Alerts Panel */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} /> Recent Alerts
            </h3>
            {summary?.alerts?.length === 0 && (
              <div className="alert-item safe"><span><CheckCircle size={18} /></span><p style={{ fontSize: '.88rem' }}>No alerts — all recent products are safe!</p></div>
            )}
            {summary?.alerts?.map((a, i) => (
              <div key={i} className={`alert-item ${a.verdict === 'DANGER' ? 'danger' : 'caution'}`}>
                <span>{VERDICT_ICON[a.verdict]}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '.85rem' }}>{a.product_name}</p>
                  <p style={{ fontSize: '.78rem', opacity: .8 }}>{a.summary}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Tracker */}
          <div className="card">
            <h3 style={{ marginBottom: '.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} /> Weekly Progress
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '.82rem', marginBottom: '1rem' }}>Avg intake from scanned products (last 7 days)</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={mockWeekly}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v, n) => [`${v}mg`, n === 'sodium' ? 'Sodium' : 'Sugar']} />
                <Area type="natural" dataKey="sodium" stroke="#2563EB" fill="url(#blueGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.75rem', marginTop: '1rem' }}>
              {[
                { label: 'Avg Sodium', value: `${progress?.avg_sodium_mg ?? 0}mg` },
                { label: 'Avg Sugar', value: `${progress?.avg_sugar_g ?? 0}g` },
                { label: 'Avg Calories', value: `${progress?.avg_calories_kcal ?? 0}kcal` },
              ].map((m) => (
                <div key={m.label} style={{ textAlign: 'center' }}>
                  <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--teal)' }}>{m.value}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Scans */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} /> Recent Scans
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/scanner')}>Scan new +</button>
          </div>
          {summary?.recent_scans?.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                <Camera size={32} color="var(--slate)" />
              </p>
              <p>No scans yet. <button className="btn btn-primary btn-sm" onClick={() => navigate('/scanner')} style={{ marginLeft: '0.5rem' }}>Start scanning!</button></p>
            </div>
          )}
          <div style={{ display: 'grid', gap: '.75rem' }}>
            {summary?.recent_scans?.map((s) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.75rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)' }}>
                {s.image_url && <img src={s.image_url} alt="" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 6 }} />}
                {!s.image_url && <div style={{ width: 44, height: 44, background: 'var(--slate-light)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate)' }}><ShoppingBag size={20} /></div>}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '.9rem' }}>{s.product_name}</p>
                  <p style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{s.brand} · {new Date(s.scanned_at).toLocaleDateString()}</p>
                </div>
                <span className={`verdict-badge verdict-${s.verdict}`} style={{ fontSize: '.78rem', padding: '.3rem .8rem' }}>
                  {VERDICT_ICON[s.verdict]} {s.verdict}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
