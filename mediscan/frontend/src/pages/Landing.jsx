import { Link } from 'react-router-dom';
import { Camera, HeartPulse, Bot, BarChart, MessageSquare, Lock, Activity, User, CheckCircle } from 'lucide-react';

const FEATURES = [
  { icon: <Camera />, title: 'Instant Barcode Scan', desc: 'Point your camera at any product barcode for real-time nutritional analysis.' },
  { icon: <HeartPulse />, title: 'MediVerdict™', desc: 'Color-coded safety verdict tailored to your exact health conditions — not generic advice.' },
  { icon: <Bot />, title: 'MediBot AI', desc: 'Ask our AI assistant anything about a product. It knows your profile and the product context.' },
  { icon: <BarChart />, title: 'Progress Tracker', desc: 'Weekly summaries of your sodium, sugar, and calorie intake from scanned products.' },
  { icon: <MessageSquare />, title: 'Community Hub', desc: 'Share recipes, discuss symptoms, and upvote health-friendly products with others.' },
  { icon: <Lock />, title: 'Private & Secure', desc: 'Your health data is encrypted. We never sell your information.' },
];

const conditions = ['Type 1 & 2 Diabetes', 'Hypertension', 'High Cholesterol', 'Celiac Disease', 'Nut & Dairy Allergy', 'CKD', 'IBS/FODMAP'];

export default function Landing() {
  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content fade-in">
            <div className="hero-eyebrow"><Activity size={16} /> Clinical-Grade Health Intelligence</div>
            <h1 className="hero-title">
              Your pocket <span>nutritionist</span> for chronic health conditions.
            </h1>
            <p className="hero-sub">
              Scan a barcode. Get an instant, personalized safety verdict based on your health conditions — not generic nutrition labels.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free →</Link>
              <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
              {conditions.map((c) => (
                <span key={c} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 20, padding: '.3rem .8rem', fontSize: '.78rem', color: 'var(--slate-dark)', fontWeight: 500 }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '5rem 0', background: 'var(--white)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {[
              { step: '01', icon: <User />, title: 'Build Your Profile', desc: 'Enter your health conditions, biometrics, and dietary goals once.' },
              { step: '02', icon: <Camera />, title: 'Scan Any Product', desc: 'Use your phone camera to scan any barcode in seconds.' },
              { step: '03', icon: <CheckCircle />, title: 'Get MediVerdict', desc: 'See an instant Safe, Caution, or Danger verdict personalized to you.' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                <h3 style={{ marginBottom: '.5rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 0', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Everything You Need</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="card" style={{ transition: 'all 200ms ease' }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow)'}>
                <div style={{ fontSize: '2rem', marginBottom: '.75rem' }}>{f.icon}</div>
                <h3 style={{ marginBottom: '.4rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 0', background: 'var(--teal)', color: '#fff', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Start Scanning Smarter Today</h2>
          <p style={{ opacity: .85, marginBottom: '2rem' }}>Free to use. No credit card required.</p>
          <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--teal)', fontWeight: 700 }}>
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f172a', color: '#cbd5e1', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div className="container">
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--white)" /> <strong style={{ color: '#fff' }}>MediScan</strong> — Not a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
