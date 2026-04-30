import { useState, useEffect } from 'react';
import api from '../api/client';
import Navbar from '../components/Navbar';

const CATEGORIES = [
  { key: null, label: '🌐 All Posts' },
  { key: 'general', label: '💬 General' },
  { key: 'recipe', label: '🍽️ Recipes' },
  { key: 'symptom', label: '🩺 Symptoms' },
];

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', category: 'general' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = category ? `?category=${category}` : '';
      const { data } = await api.get(`/api/community/posts${params}`);
      setPosts(data.posts);
    } catch { console.error('Failed to load posts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [category]);

  const vote = async (id, dir) => {
    try {
      const { data } = await api.post(`/api/community/posts/${id}/vote`, { direction: dir });
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, ...data, net_votes: data.upvotes - data.downvotes } : p));
    } catch { console.error('Vote failed'); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError(''); setSubmitting(true);
    try {
      await api.post('/api/community/posts', form);
      setShowForm(false);
      setForm({ title: '', body: '', category: 'general' });
      await load();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create post.');
    } finally { setSubmitting(false); }
  };

  const catStyle = { general: 'cat-general', recipe: 'cat-recipe', symptom: 'cat-symptom' };

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem' }}>Community Hub</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>Share recipes, discuss symptoms, and rate health-friendly products.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ New Post'}
          </button>
        </div>

        {/* New Post Form */}
        {showForm && (
          <div className="card fade-in" style={{ marginBottom: '1.5rem', border: '1.5px solid var(--teal)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Create a Post</h3>
            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="general">💬 General Discussion</option>
                  <option value="recipe">🍽️ Recipe Exchange</option>
                  <option value="symptom">🩺 Symptom Tracking</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="post-title">Title</label>
                <input id="post-title" type="text" className="form-input" placeholder="What's your post about?"
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="post-body">Body</label>
                <textarea id="post-body" className="form-input" rows={4} placeholder="Share your experience, recipe, or question..."
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
              </div>
              {formError && <div className="alert-item danger" style={{ marginBottom: '1rem' }}><span>⚠️</span><p>{formError}</p></div>}
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? '⏳ Publishing...' : '📢 Publish Post'}
              </button>
            </form>
          </div>
        )}

        {/* Category filter */}
        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map(({ key, label }) => (
            <button key={String(key)} onClick={() => setCategory(key)}
              className={`btn ${category === key ? 'btn-primary' : 'btn-outline'} btn-sm`}>
              {label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>⏳ Loading posts…</p>}
        {!loading && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '2rem' }}>💬</p>
            <p>No posts yet. Be the first to share!</p>
          </div>
        )}

        <div style={{ display: 'grid', gap: '1rem' }}>
          {posts.map((p) => (
            <div key={p.id} className="post-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginBottom: '.5rem', flexWrap: 'wrap' }}>
                    <span className={`post-category ${catStyle[p.category] || 'cat-general'}`}>{p.category}</span>
                    <span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>by {p.author} · {new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 style={{ marginBottom: '.4rem', fontSize: '1rem' }}>{p.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '.88rem', lineHeight: 1.6 }}>{p.body}</p>
                  {p.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: '.4rem', marginTop: '.6rem', flexWrap: 'wrap' }}>
                      {p.tags.map((t) => <span key={t} style={{ fontSize: '.72rem', background: 'var(--teal-bg)', color: 'var(--teal)', borderRadius: 4, padding: '.15rem .5rem' }}>#{t}</span>)}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', alignItems: 'center', minWidth: 60 }}>
                  <button className="vote-btn up" onClick={() => vote(p.id, 'up')}>👍 {p.upvotes}</button>
                  <button className="vote-btn down" onClick={() => vote(p.id, 'down')}>👎 {p.downvotes}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
