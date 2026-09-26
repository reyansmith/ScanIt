import { useState } from 'react';
import { Check } from 'lucide-react';
import AppShell from './AppShell';

export default function PageShell({ eyebrow, title, subtitle, action, children, className = '' }) {
  const [toast, setToast] = useState('');

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  return (
    <AppShell onDemoNavigate={notify}>
      <main className={`product-page ${className}`}>
        <header className="product-page-header">
          <div>
            {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action && <div className="page-action">{typeof action === 'function' ? action(notify) : action}</div>}
        </header>
        {typeof children === 'function' ? children({ notify }) : children}
      </main>
      {toast && <div className="toast" role="status"><Check size={17} /> {toast}</div>}
    </AppShell>
  );
}
