import { useMemo, useState } from 'react';
import { BookOpen, Heart, MessageCircle, Plus, Search, Send, Star, ThumbsUp, Users, X } from 'lucide-react';
import PageShell from '../components/PageShell';
import StatusPill from '../components/StatusPill';

const initialPosts = [
  { id: 1, category: 'Recipes', title: 'My low-sodium overnight oats', body: 'I swapped flavored yogurt for plain Greek yogurt and added berries and cinnamon. It has become my easiest weekday breakfast.', author: 'Maya R.', time: '2h ago', likes: 34, comments: 8, tags: ['lower sodium', 'breakfast'] },
  { id: 2, category: 'Product Finds', title: 'A cereal that finally works for my morning goals', body: 'Oat & Seed Crunch scored well for my profile and keeps me full longer. Sharing in case anyone else is looking for higher fiber.', author: 'Jordan P.', time: '5h ago', likes: 26, comments: 6, tags: ['cereal', 'high fiber'] },
  { id: 3, category: 'Discussion', title: 'How do you compare labels without getting overwhelmed?', body: 'I have started checking sodium first, then added sugar. What simple routine works for you?', author: 'Elena S.', time: 'Yesterday', likes: 19, comments: 14, tags: ['label reading'] },
];

export default function Community() {
  const [posts, setPosts] = useState(initialPosts);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', category: 'Discussion' });
  const filtered = useMemo(() => posts.filter((post) => (category === 'All' || post.category === category) && `${post.title} ${post.body}`.toLowerCase().includes(query.toLowerCase())), [posts, category, query]);

  return (
    <PageShell title="Community Hub" subtitle="A supportive place to share food experiences, recipes, and product discoveries." action={<button className="button primary" onClick={() => setFormOpen(true)}><Plus size={18} /> Start a discussion</button>}>
      {({ notify }) => <>
        <section className="community-intro"><div><span className="metric-icon green"><Users size={21} /></span><strong>4,280</strong><p>Supportive members</p></div><div><span className="metric-icon amber"><BookOpen size={21} /></span><strong>186</strong><p>Recipes shared</p></div><div><span className="metric-icon violet"><Star size={21} /></span><strong>932</strong><p>Product reviews</p></div><p><Heart size={19} /> Community experiences are personal stories, not medical advice.</p></section>

        <div className="community-layout">
          <section className="community-feed">
            <div className="community-toolbar"><div className="history-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search discussions and recipes…" aria-label="Search community" /></div><div className="community-tabs">{['All','Recipes','Product Finds','Discussion'].map((item) => <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div></div>
            <div className="post-list">
              {filtered.map((post) => <article className="community-post surface-panel" key={post.id}>
                <header><span className="community-avatar">{post.author[0]}</span><div><strong>{post.author}</strong><small>{post.time}</small></div><StatusPill status={post.category === 'Product Finds' ? 'suitable' : 'info'}>{post.category}</StatusPill></header>
                <h2>{post.title}</h2><p>{post.body}</p><div className="post-tags">{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
                <footer><button onClick={() => setPosts(posts.map((candidate) => candidate.id === post.id ? { ...candidate, likes: candidate.likes + 1 } : candidate))}><ThumbsUp size={16} /> {post.likes}</button><button onClick={() => notify(`${post.comments} community replies opened.`)}><MessageCircle size={16} /> {post.comments} replies</button><button onClick={() => notify('Post saved to your community collection.')}>Save</button></footer>
              </article>)}
              {filtered.length === 0 && <div className="empty-state surface-panel"><MessageCircle size={28} /><h3>No discussions found</h3><p>Try another search or be the first to start one.</p></div>}
            </div>
          </section>

          <aside className="community-side">
            <section className="surface-panel popular-recipes"><div className="section-title-row compact"><div><h2>Popular recipes</h2><p>Community favorites this week</p></div><BookOpen size={20} color="var(--green-700)" /></div>{['Herby lentil bowl','Berry oat breakfast','Roasted veggie wraps'].map((name,index) => <button onClick={() => notify(`${name} recipe opened.`)} key={name}><span>{index + 1}</span><div><strong>{name}</strong><small>{[128,94,77][index]} saves</small></div></button>)}</section>
            <section className="surface-panel community-products"><div className="section-title-row compact"><div><h2>Health-friendly finds</h2><p>Highly rated by the community</p></div><Star size={20} color="var(--amber-500)" /></div><div><img src="/assets/oat-seed-crunch.png" alt="Oat & Seed Crunch" /><span><strong>Oat &amp; Seed Crunch</strong><small>4.8 community rating</small><StatusPill status="suitable">Popular choice</StatusPill></span></div></section>
          </aside>
        </div>

        {formOpen && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setFormOpen(false)}><section className="scan-modal community-modal" role="dialog" aria-modal="true" aria-labelledby="new-post-title"><button className="modal-close" onClick={() => setFormOpen(false)} aria-label="Close"><X size={17} /></button><h2 id="new-post-title">Start a discussion</h2><p>Share a recipe, product find, or food experience with the community.</p><form onSubmit={(event) => { event.preventDefault(); if (!form.title.trim() || !form.body.trim()) return; setPosts([{ id: Date.now(), ...form, author: 'Alex', time: 'Just now', likes: 0, comments: 0, tags: ['new'] }, ...posts]); setFormOpen(false); setForm({ title: '', body: '', category: 'Discussion' }); notify('Your community post was published.'); }}><label htmlFor="post-category">Category</label><select id="post-category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Discussion</option><option>Recipes</option><option>Product Finds</option></select><label htmlFor="post-title">Title</label><input id="post-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="What would you like to share?" /><label htmlFor="post-body">Your experience</label><textarea id="post-body" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} rows={4} placeholder="Share helpful context with the community…" /><button className="button primary"><Send size={17} /> Publish post</button></form></section></div>}
      </>}
    </PageShell>
  );
}
