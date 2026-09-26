import { useState } from 'react';
import { Activity, AlertCircle, CalendarClock, Check, ChevronRight, HeartPulse, Leaf, Plus, ShieldCheck, Target, Utensils } from 'lucide-react';
import PageShell from '../components/PageShell';

const sections = [
  { key: 'conditions', title: 'Health conditions', subtitle: 'Used to personalize product explanations', icon: HeartPulse, items: ['High blood pressure', 'High cholesterol'] },
  { key: 'allergies', title: 'Allergies', subtitle: 'Ingredients ScanIt should always check', icon: ShieldCheck, items: ['Tree nuts', 'Shellfish'] },
  { key: 'preferences', title: 'Dietary preferences', subtitle: 'How you prefer to eat', icon: Utensils, items: ['Vegetarian', 'Lower sugar'] },
  { key: 'goals', title: 'Nutritional goals', subtitle: 'What you are currently working toward', icon: Target, items: ['Reduce sodium', 'Increase fiber', 'Increase protein'] },
];

export default function ProfileSetup() {
  const [editing, setEditing] = useState('');
  const [profile, setProfile] = useState(Object.fromEntries(sections.map((section) => [section.key, section.items])));
  const [draft, setDraft] = useState('');

  return (
    <PageShell title="My Health" subtitle="The information ScanIt uses to make every product explanation more relevant." action={(notify) => <button className="button primary" onClick={() => notify('Your health profile is up to date.')}><Check size={18} /> Save changes</button>}>
      {({ notify }) => <>
        <section className="health-overview">
          <div className="profile-completeness surface-panel"><div className="completeness-ring"><strong>92%</strong></div><div><p className="page-eyebrow">Profile completeness</p><h2>Your profile is in great shape</h2><p>Add medication preferences to make product explanations even more relevant.</p></div><button onClick={() => notify('Profile suggestions opened.')}><ChevronRight size={20} /></button></div>
          <div className="profile-facts surface-panel"><div><CalendarClock size={19} /><span><strong>Last reviewed</strong><small>September 20, 2026</small></span></div><div><Activity size={19} /><span><strong>Used in 48 scans</strong><small>Updated recommendations instantly</small></span></div></div>
        </section>

        <div className="health-layout">
          <div className="health-sections">
            {sections.map(({ key, title, subtitle, icon: Icon }) => <section className="surface-panel health-section" key={key}>
              <div className="health-section-heading"><span className="metric-icon green"><Icon size={20} /></span><div><h2>{title}</h2><p>{subtitle}</p></div><button className="text-button" onClick={() => setEditing(editing === key ? '' : key)}>{editing === key ? 'Done' : 'Edit'}</button></div>
              <div className="health-chips">{profile[key].map((item) => <span key={item}>{item}{editing === key && <button aria-label={`Remove ${item}`} onClick={() => setProfile({ ...profile, [key]: profile[key].filter((entry) => entry !== item) })}>×</button>}</span>)}</div>
              {editing === key && <form className="health-add-form" onSubmit={(event) => { event.preventDefault(); if (!draft.trim()) return; setProfile({ ...profile, [key]: [...profile[key], draft.trim()] }); notify(`${draft.trim()} added to ${title.toLowerCase()}.`); setDraft(''); }}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Add to ${title.toLowerCase()}…`} aria-label={`Add ${title}`} /><button className="button secondary compact-button" disabled={!draft.trim()}><Plus size={15} /> Add</button></form>}
            </section>)}
          </div>

          <aside className="health-side-stack">
            <section className="surface-panel personalization-card"><span className="metric-icon violet"><Leaf size={20} /></span><h2>How personalization works</h2><p>ScanIt compares product ingredients and nutrition information with the preferences in this profile.</p><ul><li><Check size={14} /> Explains why something was flagged</li><li><Check size={14} /> Finds more suitable alternatives</li><li><Check size={14} /> Tracks patterns over time</li></ul></section>
            <section className="profile-note"><AlertCircle size={20} /><div><strong>Keep your profile relevant</strong><p>ScanIt recommends reviewing this information regularly. Recommendations are informational and are not medical advice.</p></div></section>
            <section className="surface-panel data-control"><ShieldCheck size={21} /><div><h3>Your information, your control</h3><p>You can update or remove profile details at any time.</p><button onClick={() => notify('Health data settings opened.')}>Manage data settings</button></div></section>
          </aside>
        </div>
      </>}
    </PageShell>
  );
}
