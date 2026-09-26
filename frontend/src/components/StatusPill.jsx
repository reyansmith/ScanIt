import { AlertTriangle, Check, Info, ShieldAlert } from 'lucide-react';

const icons = { suitable: Check, caution: AlertTriangle, flagged: ShieldAlert, info: Info };

export default function StatusPill({ status = 'info', children }) {
  const Icon = icons[status] || Info;
  return <span className={`status-pill ${status}`}><Icon size={13} strokeWidth={2.4} />{children}</span>;
}
