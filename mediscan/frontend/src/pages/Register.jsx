import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../api/client';
import useStore from '../store/useStore';

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setToken = useStore((s) => s.setToken);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', {
        email: form.email, password: form.password, full_name: form.full_name,
      });
      setToken(data.access_token);
      navigate('/profile-setup');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafb 0%, #e6f5f5 100%)', padding: '2rem' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '.5rem', display: 'flex', justifyContent: 'center' }}><Activity size={32} color="var(--text)" /></div>
          <h2>Join MediScan</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginTop: '.3rem' }}>Free forever. No credit card needed.</p>
        </div>

        {error && <div className="alert-item danger" style={{ marginBottom: '1rem', textAlign: 'left' }}><span><AlertTriangle size={18} /></span><p style={{ fontSize: '.88rem' }}>{error}</p></div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input id="reg-name" type="text" className="form-input" placeholder="Jane Doe"
              value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input id="reg-email" type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-pass">Password</label>
            <input id="reg-pass" type="password" className="form-input" placeholder="Min 8 characters"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <input id="reg-confirm" type="password" className="form-input" placeholder="Repeat password"
              value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '.5rem' }} disabled={loading}>
            {loading ? <><Loader2 className="spin" size={16} /> Creating account...</> : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.88rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--teal)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
