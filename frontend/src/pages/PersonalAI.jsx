import { useState } from 'react';
import { ArrowUp, Bot, CheckCircle2, Clock3, Lightbulb, Loader2, Plus, ScanLine, Sparkles } from 'lucide-react';
import PageShell from '../components/PageShell';
import StatusPill from '../components/StatusPill';

const suggestions = ['Why was my last product flagged?', 'Compare today’s scanned products.', 'What should I buy this week?', 'What ingredients should I watch?'];

export default function PersonalAI() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi Alex — I’m ScanIt’s personal health assistant. I can explain scanned products, compare choices, and help with your shopping list.' },
  ]);

  const send = (message = input) => {
    const value = message.trim();
    if (!value || loading) return;
    setMessages((current) => [...current, { role: 'user', text: value }]);
    setInput('');
    setLoading(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, { role: 'assistant', text: 'Your latest scan, Whole Grain Cereal, is a good match overall. It supports your fiber goal, but its 230mg sodium is above the breakfast preference in your profile. Oat & Seed Crunch is the stronger alternative at 92 compatibility.' }]);
      setLoading(false);
    }, 900);
  };

  return (
    <PageShell title="Ask ScanIt" subtitle="Personal answers grounded in your scans, shopping list, and health profile." action={(notify) => <button className="button secondary" onClick={() => { setMessages([{ role: 'assistant', text: 'New conversation started. What would you like to understand?' }]); notify('New conversation started.'); }}><Plus size={18} /> New conversation</button>}>
      <div className="ai-layout">
        <section className="ai-chat-panel surface-panel" aria-label="Ask ScanIt conversation">
          <div className="ai-chat-scroll">
            <div className="ai-welcome"><span className="ai-avatar"><Sparkles size={23} /></span><div><h2>Personal health intelligence, in plain language</h2><p>Ask about ingredients, recent scans, nutrition patterns, or better alternatives.</p></div></div>
            {messages.map((message, index) => <div className={`ai-message ${message.role}`} key={`${message.role}-${index}`}>
              {message.role === 'assistant' && <span className="message-avatar"><Bot size={17} /></span>}
              <div>{message.text}{message.role === 'assistant' && index > 0 && <div className="inline-context"><img src="/assets/oat-seed-crunch.png" alt="" /><span><strong>Oat &amp; Seed Crunch</strong><small>92 compatibility · Lower sodium</small></span><StatusPill status="suitable">Better fit</StatusPill></div>}</div>
            </div>)}
            {loading && <div className="ai-message assistant"><span className="message-avatar"><Bot size={17} /></span><div className="typing-state"><Loader2 className="spin" size={16} /> Looking across your recent scans…</div></div>}
          </div>
          <div className="suggested-prompts">{suggestions.map((suggestion) => <button onClick={() => send(suggestion)} key={suggestion}>{suggestion}</button>)}</div>
          <form className="ai-composer" onSubmit={(event) => { event.preventDefault(); send(); }}><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask ScanIt about a product, ingredient, or trend…" aria-label="Message Ask ScanIt" rows={2} /><div><span>Uses your current profile and mock product data</span><button disabled={!input.trim() || loading} aria-label="Send message"><ArrowUp size={19} /></button></div></form>
        </section>

        <aside className="ai-context-rail">
          <section className="surface-panel context-card"><div className="section-title-row compact"><div><h2>Current context</h2><p>What ScanIt is using</p></div><Sparkles size={19} color="var(--violet-700)" /></div><div className="context-product"><img src="/assets/whole-grain-cereal.png" alt="Whole Grain Cereal" /><div><strong>Whole Grain Cereal</strong><span>Latest scan · 82/100</span></div></div><div className="context-fact"><CheckCircle2 size={16} /><span><strong>Profile</strong> Lower sodium, higher fiber</span></div><div className="context-fact"><Clock3 size={16} /><span><strong>History</strong> 48 products scanned</span></div></section>
          <section className="insight-panel mint compact-insight"><span className="insight-icon"><Lightbulb size={20} /></span><div><p className="page-eyebrow">Suggested insight</p><h2>Sodium has trended down 12%</h2><p>Your recent breakfast choices are improving.</p><button onClick={() => send('Show me my sodium trend.')}>Ask about this</button></div></section>
          <section className="surface-panel ai-shortcuts"><h2>Quick actions</h2><button onClick={() => send('Compare my two most recent scans.')}><ScanLine size={17} /> Compare recent scans</button><button onClick={() => send('Build a healthier shopping list for me.')}><Plus size={17} /> Build a shopping list</button></section>
        </aside>
      </div>
    </PageShell>
  );
}
