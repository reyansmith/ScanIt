import { useState, useRef, useEffect } from 'react';
import useStore from '../store/useStore';
import api from '../api/client';

const SUGGESTIONS = [
  'Is this keto-friendly?',
  'Why is this flagged for diabetes?',
  'Suggest a safer alternative',
  'Is this safe for high blood pressure?',
];

export default function MediBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hi! I\'m MediBot 🩺 I know your health profile and the product you just scanned. Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const currentScan = useStore((s) => s.currentScan);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    const botMsg = { role: 'bot', content: '' };
    setMessages((prev) => [...prev, botMsg]);

    try {
      const history = messages.filter(m => m.role !== 'bot' || m.content).slice(-6);
      const res = await fetch('http://localhost:8000/api/bot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ms_token')}`,
        },
        body: JSON.stringify({
          message: msg,
          product_context: currentScan?.product || {},
          chat_history: history,
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const token = line.replace('data: ', '');
          if (token === '[DONE]') break;
          accumulated += token;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'bot', content: accumulated };
            return updated;
          });
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'bot', content: 'Sorry, I couldn\'t connect right now. Please try again.' };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="medibot-trigger" onClick={() => setOpen(!open)} aria-label="Open MediBot">
        {open ? '✕' : '🤖'}
      </button>
      {open && (
        <div className="medibot-panel fade-in">
          <div className="medibot-header">
            <div>
              <div style={{ fontWeight: 700, fontSize: '.95rem' }}>🤖 MediBot</div>
              <div style={{ fontSize: '.75rem', opacity: .85 }}>AI Health Assistant</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
          </div>

          <div className="medibot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                {m.content || <span className="spin" style={{ display: 'inline-block' }}>⏳</span>}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 2 && (
            <div style={{ padding: '0 .8rem .6rem', display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)} className="btn btn-outline btn-sm" style={{ fontSize: '.75rem' }}>{s}</button>
              ))}
            </div>
          )}

          <div className="medibot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask MediBot..."
              disabled={loading}
            />
            <button className="btn btn-primary btn-sm" onClick={() => send()} disabled={loading || !input.trim()}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
