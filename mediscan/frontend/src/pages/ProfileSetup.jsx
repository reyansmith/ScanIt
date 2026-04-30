import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';

const CONDITIONS = [
  'Type 1 Diabetes', 'Type 2 Diabetes',
  'Hypertension (High Blood Pressure)', 'Hypercholesterolemia (High Cholesterol)',
  'Chronic Kidney Disease (CKD)', 'Celiac Disease',
  'Nut Allergy (General)', 'Dairy Allergy', 'IBS/FODMAP Sensitivity',
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (little/no exercise)' },
  { value: 'light', label: 'Light (1–3 days/week)' },
  { value: 'moderate', label: 'Moderate (3–5 days/week)' },
  { value: 'active', label: 'Active (6–7 days/week)' },
];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    height_cm: '', weight_kg: '', age: '', activity_level: 'moderate',
    health_conditions: [],
  });

  const toggleCondition = (c) => {
    setForm((prev) => ({
      ...prev,
      health_conditions: prev.health_conditions.includes(c)
        ? prev.health_conditions.filter((x) => x !== c)
        : [...prev.health_conditions, c],
    }));
  };

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      await api.put('/api/profile', {
        ...form,
        height_cm: Number(form.height_cm) || null,
        weight_kg: Number(form.weight_kg) || null,
        age: Number(form.age) || null,
      });
      setSaved(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch { setError('Failed to save profile. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="container" style={{ maxWidth: 640, paddingTop: '3rem', paddingBottom: '3rem' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '2rem' }}>
          {[1, 2].map((s) => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: step >= s ? 'var(--teal)' : 'var(--border)', transition: 'background 300ms ease' }} />
          ))}
        </div>

        {step === 1 && (
          <div className="card fade-in">
            <h2 style={{ marginBottom: '.4rem' }}>Your Biometrics</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginBottom: '1.5rem' }}>
              Used to personalize your health recommendations.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ps-height">Height (cm)</label>
                <input id="ps-height" type="number" className="form-input" placeholder="175"
                  value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ps-weight">Weight (kg)</label>
                <input id="ps-weight" type="number" className="form-input" placeholder="70"
                  value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ps-age">Age</label>
                <input id="ps-age" type="number" className="form-input" placeholder="35"
                  value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ps-activity">Activity Level</label>
                <select id="ps-activity" className="form-select"
                  value={form.activity_level} onChange={(e) => setForm({ ...form, activity_level: e.target.value })}>
                  {ACTIVITY_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-primary" onClick={() => setStep(2)}>Next: Health Conditions →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card fade-in">
            <h2 style={{ marginBottom: '.4rem' }}>Health Conditions</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginBottom: '1.5rem' }}>
              Select all that apply. This powers your MediVerdict™ analysis.
            </p>
            <div className="conditions-grid" style={{ marginBottom: '1.5rem' }}>
              {CONDITIONS.map((c) => (
                <button key={c} className={`condition-chip ${form.health_conditions.includes(c) ? 'selected' : ''}`}
                  onClick={() => toggleCondition(c)}>
                  {form.health_conditions.includes(c) ? '✓ ' : ''}{c}
                </button>
              ))}
            </div>

            {form.health_conditions.length === 0 && (
              <div className="alert-item caution" style={{ marginBottom: '1rem' }}>
                <span>💡</span>
                <p style={{ fontSize: '.85rem' }}>Select at least one condition for personalized verdicts. You can update this anytime.</p>
              </div>
            )}

            {error && <div className="alert-item danger" style={{ marginBottom: '1rem' }}><span>⚠️</span><p>{error}</p></div>}
            {saved && <div className="alert-item safe" style={{ marginBottom: '1rem' }}><span>✅</span><p style={{ fontWeight: 600 }}>Profile saved! Redirecting…</p></div>}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={submit} disabled={loading || saved}>
                {loading ? '⏳ Saving...' : 'Save Profile & Continue →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
