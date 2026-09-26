import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CalendarClock, Camera, CheckCircle2, ChevronRight, ClipboardList, HeartPulse, Lightbulb, ShoppingBasket, Sparkles } from 'lucide-react';
import PageShell from '../components/PageShell';
import StatusPill from '../components/StatusPill';

const scans = [
  { name: 'Whole Grain Cereal', detail: 'Harvest & Co. · Today, 10:32 AM', score: 82, status: 'suitable', label: 'Good Match', image: '/assets/whole-grain-cereal.png' },
  { name: 'Oat & Seed Crunch', detail: 'Harvest & Co. · Yesterday', score: 92, status: 'suitable', label: 'Excellent Match', image: '/assets/oat-seed-crunch.png' },
  { name: 'Simple Grain Flakes', detail: 'Harvest & Co. · Sep 25', score: 88, status: 'suitable', label: 'Great Match', image: '/assets/simple-grain-flakes.png' },
];

export default function Home() {
  return (
    <PageShell
      eyebrow="Sunday, September 27"
      title="Good morning, Alex"
      subtitle="Here’s what’s happening with your health and food choices."
      action={<Link className="button primary" to="/scanner"><Camera size={18} /> Scan a Product</Link>}
      className="home-page"
    >
      {({ notify }) => <>
        <section className="week-overview" aria-labelledby="week-heading">
          <div className="section-title-row"><div><p className="page-eyebrow">Your week</p><h2 id="week-heading">Small choices, moving in the right direction</h2></div><button className="text-button" onClick={() => notify('Weekly summary opened.')}>View summary <ArrowRight size={15} /></button></div>
          <div className="metric-strip">
            <div><span className="metric-icon green"><Camera size={19} /></span><strong>18</strong><p>Products scanned</p><small>+4 from last week</small></div>
            <div><span className="metric-icon amber"><AlertTriangle size={19} /></span><strong>3</strong><p>Products flagged</p><small>2 fewer than last week</small></div>
            <div><span className="metric-icon green"><CheckCircle2 size={19} /></span><strong>14</strong><p>Suitable choices</p><small>78% of your scans</small></div>
            <div><span className="metric-icon violet"><ShoppingBasket size={19} /></span><strong>7</strong><p>Shopping items</p><small>4 ready to buy</small></div>
          </div>
        </section>

        <div className="home-grid">
          <section className="surface-panel recent-panel" aria-labelledby="recent-heading">
            <div className="section-title-row compact"><div><h2 id="recent-heading">Recent scans</h2><p>Your latest product checks</p></div><Link className="text-button" to="/history">View history <ChevronRight size={15} /></Link></div>
            <div className="scan-list">
              {scans.map((scan) => <Link to="/scanner" className="scan-list-item" key={scan.name}>
                <img src={scan.image} alt="" />
                <div className="scan-list-copy"><strong>{scan.name}</strong><span>{scan.detail}</span></div>
                <StatusPill status={scan.status}>{scan.label}</StatusPill>
                <div className="list-score"><strong>{scan.score}</strong><span>/100</span></div>
                <ChevronRight size={18} />
              </Link>)}
            </div>
          </section>

          <aside className="home-side-stack">
            <section className="insight-panel mint">
              <span className="insight-icon"><Lightbulb size={21} /></span>
              <div><p className="page-eyebrow">Personalized insight</p><h2>You’ve been choosing lower-sodium products this week.</h2><p>Average sodium across your scans is down 12% compared with last week.</p><Link to="/dashboard">See your trend <ArrowRight size={15} /></Link></div>
            </section>
            <section className="surface-panel profile-reminder">
              <span className="metric-icon amber"><CalendarClock size={20} /></span>
              <div><h3>Keep your profile current</h3><p>Your health information was last reviewed 7 days ago.</p><Link className="button secondary compact-button" to="/health">Review My Health</Link></div>
            </section>
          </aside>
        </div>

        <div className="home-bottom-grid">
          <section className="surface-panel alerts-panel">
            <div className="section-title-row compact"><div><h2>Recent alerts</h2><p>Important details from your scans</p></div><HeartPulse size={21} color="var(--green-700)" /></div>
            <div className="compact-alert caution"><AlertTriangle size={19} /><div><strong>Sodium above your preference</strong><p>Whole Grain Cereal contains 230mg per serving.</p></div><Link to="/scanner">Review</Link></div>
            <div className="compact-alert info"><Sparkles size={19} /><div><strong>New recommendation ready</strong><p>We found a higher-fiber alternative for your breakfast list.</p></div><button onClick={() => notify('Recommendation added to your review queue.')}>View</button></div>
          </section>

          <section className="surface-panel shopping-preview">
            <div className="section-title-row compact"><div><h2>This week’s shopping</h2><p>4 of 7 items ready</p></div><Link className="text-button" to="/shopping">Open list <ChevronRight size={15} /></Link></div>
            <div className="shopping-progress"><span style={{ width: '57%' }} /></div>
            <ul><li><CheckCircle2 size={17} />Oat &amp; Seed Crunch</li><li><CheckCircle2 size={17} />Unsalted peanut butter</li><li><span className="unchecked" />Almond milk</li></ul>
          </section>

          <section className="surface-panel recommendation-panel">
            <div className="section-title-row compact"><div><h2>Recommended for you</h2><p>Based on your current goals</p></div><ClipboardList size={21} color="var(--green-700)" /></div>
            <div className="recommendation-product"><img src="/assets/oat-seed-crunch.png" alt="Oat & Seed Crunch" /><div><StatusPill status="suitable">92 compatibility</StatusPill><h3>Oat &amp; Seed Crunch</h3><p>Lower sodium · Higher fiber</p></div></div>
          </section>
        </div>
      </>}
    </PageShell>
  );
}
