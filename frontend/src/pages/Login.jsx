import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Leaf, Loader2 } from 'lucide-react';
import api from '../api/client';
import useStore from '../store/useStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setToken = useStore((s) => s.setToken);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', form);
      setToken(data.access_token);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/home" className="auth-brand"><span className="brand-mark"><Leaf size={25} /></span><strong>ScanIt</strong></Link>
          <h2>Welcome back</h2>
          <p>Sign in to continue making better choices.</p>
        </div>

        {error && (
          <div className="alert-item danger" style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <span><AlertTriangle size={18} /></span><p style={{ fontSize: '.88rem' }}>{error}</p>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input id="login-email" type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input id="login-password" type="password" className="form-input" placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="button primary auth-submit" disabled={loading}>
            {loading ? <><Loader2 className="spin" size={16} /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.88rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
