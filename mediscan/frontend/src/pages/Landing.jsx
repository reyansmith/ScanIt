import { Link } from 'react-router-dom';

const features = [
  { icon: '📷', title: 'Instant Barcode Scan', desc: 'Point your camera at any product barcode for real-time nutritional analysis.' },
  { icon: '🏥', title: 'MediVerdict™', desc: 'Color-coded safety verdict tailored to your exact health conditions — not generic advice.' },
  { icon: '🤖', title: 'MediBot AI', desc: 'Ask our AI assistant anything about a product. It knows your profile and the product context.' },
  { icon: '📊', title: 'Progress Tracker', desc: 'Weekly summaries of your sodium, sugar, and calorie intake from scanned products.' },
  { icon: '💬', title: 'Community Hub', desc: 'Share recipes, discuss symptoms, and upvote health-friendly products with others.' },
  { icon: '🔒', title: 'Private & Secure', desc: 'Your health data is encrypted. We never sell your information.' },
];

const conditions = ['Type 1 & 2 Diabetes', 'Hypertension', 'High Cholesterol', 'Celiac Disease', 'Nut & Dairy Allergy', 'CKD', 'IBS/FODMAP'];

export default function Landing() {
  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-eyebrow">🩺 Clinical-Grade Health Intelligence</div>
            <h1 className="hero-title">
              Know If Any Product<br /><span>Is Safe For You.</span>
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
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>How MediScan Works</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '.5rem' }}>Three steps to smarter shopping</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {[
              { step: '01', icon: '👤', title: 'Build Your Profile', desc: 'Enter your health conditions, biometrics, and dietary goals once.' },
              { step: '02', icon: '📷', title: 'Scan Any Product', desc: 'Use your phone camera to scan any barcode in seconds.' },
              { step: '03', icon: '✅', title: 'Get MediVerdict', desc: 'See an instant Safe, Caution, or Danger verdict personalized to you.' },
            ].map((s) => (
              <div key={s.step} style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--teal)', letterSpacing: '.1em', marginBottom: '.5rem' }}>STEP {s.step}</div>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{s.icon}</div>
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
            {features.map((f) => (
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
      <footer style={{ background: 'var(--slate-dark)', color: '#cbd5e0', padding: '2rem 0', textAlign: 'center', fontSize: '.85rem' }}>
        <div className="container">
          <p>🩺 <strong style={{ color: '#fff' }}>MediScan</strong> — Not a substitute for professional medical advice.</p>
        </div>
      </footer>
    </div>
  );
}
