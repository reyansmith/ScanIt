import { CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

const ICONS = { 
  SAFE: <CheckCircle size={18} strokeWidth={2.5} />, 
  CAUTION: <AlertTriangle size={18} strokeWidth={2.5} />, 
  DANGER: <ShieldAlert size={18} strokeWidth={2.5} /> 
};
const LABELS = { SAFE: 'Safe for You', CAUTION: 'Use Caution', DANGER: 'Not Recommended' };

export default function MediVerdict({ verdict, flags = [] }) {
  if (!verdict) return null;
  return (
    <div className="fade-in" style={{ margin: '1.5rem 0' }}>
      <div style={{ marginBottom: '.75rem' }}>
        <span className={`verdict-badge verdict-${verdict}`} style={{ fontSize: '1.1rem', padding: '.65rem 1.6rem' }}>
          {ICONS[verdict]} {LABELS[verdict]}
        </span>
      </div>
      {flags.length > 0 && (
        <div>
          <p style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--slate-dark)', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Flagged Issues
          </p>
          {flags.map((f, i) => (
            <div key={i} className={`alert-item ${verdict === 'DANGER' ? 'danger' : 'caution'}`}>
              <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
                {verdict === 'DANGER' ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
              </span>
              <div>
                <p style={{ fontWeight: 600, fontSize: '.88rem', marginBottom: '.1rem' }}>{f.reason}</p>
                <p style={{ fontSize: '.8rem', opacity: .8 }}>
                  {f.condition}
                  {f.value != null && ` — ${f.value.toFixed(1)}${f.unit} (limit: ${f.threshold}${f.unit})`}
                  {f.keyword && ` — contains "${f.keyword}"`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
