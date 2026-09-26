import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChartNoAxesColumnIncreasing, ChevronDown, Clock3, Heart, Home, Leaf, Search, ShoppingCart, Sparkles, Users } from 'lucide-react';

const primaryNav = [
  { label: 'Home', icon: Home, to: '/home' },
  { label: 'Search & Understand', icon: Search, to: '/scanner' },
  { label: 'Smart Shopping', icon: ShoppingCart, to: '/shopping' },
  { label: 'Dashboard', icon: ChartNoAxesColumnIncreasing, to: '/dashboard' },
  { label: 'Scan History', icon: Clock3, to: '/history' },
  { label: 'My Health', icon: Heart, to: '/health' },
  { label: 'Personal AI', icon: Sparkles, to: '/ai' },
];

const notifications = [
  { title: 'New personalized insight', detail: 'Your lower-sodium choices improved this week.', unread: true },
  { title: 'Profile review due', detail: 'It has been 7 days since your last health review.', unread: true },
  { title: 'Shopping list updated', detail: '3 better-match products are ready to review.', unread: false },
];

export default function AppShell({ children, onDemoNavigate }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate('/scanner');
    onDemoNavigate?.(`Searching for “${query.trim()}”`);
  };

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${mobileOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
        <button className="sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation">×</button>
        <NavLink to="/home" className="brand-lockup" aria-label="ScanIt home">
          <span className="brand-mark" aria-hidden="true"><Leaf size={26} strokeWidth={2.4} /></span>
          <span><strong>ScanIt</strong><small>Food choices for your life</small></span>
        </NavLink>
        <nav className="sidebar-nav">
          {primaryNav.map(({ label, icon: Icon, to }) => (
            <NavLink key={label} to={to} onClick={() => setMobileOpen(false)} className={({ isActive }) => `sidebar-link ${isActive || (label === 'Search & Understand' && location.pathname === '/scanner') ? 'active' : ''}`}>
              <Icon size={21} strokeWidth={1.8} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-secondary">
          <NavLink to="/community" className="sidebar-link"><Users size={21} strokeWidth={1.8} /><span>Community Hub</span></NavLink>
        </div>
        <div className="sidebar-message"><span className="brand-mark small"><Leaf size={20} /></span><span>Better choices<br />a brighter you.</span></div>
      </aside>
      {mobileOpen && <button className="sidebar-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}

      <div className="app-main">
        <header className="app-header">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation">☰</button>
          <form className="global-search" onSubmit={handleSearch} role="search">
            <Search size={19} aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for a product, brand, or ingredient…" aria-label="Search products" />
          </form>
          <div className="header-actions">
            <div className="header-popover-wrap">
              <button className="icon-button notification-button" aria-label="Notifications, 2 unread" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen((value) => !value); setProfileOpen(false); }}>
                <Bell size={21} /><span className="notification-dot" />
              </button>
              {notificationsOpen && (
                <div className="notification-popover" role="dialog" aria-label="Notifications">
                  <div className="popover-heading"><strong>Notifications</strong><button onClick={() => setNotificationsOpen(false)}>Close</button></div>
                  {notifications.map((item) => <div className={`notification-item ${item.unread ? 'unread' : ''}`} key={item.title}><span className="notification-status" aria-hidden="true" /><div><strong>{item.title}</strong><p>{item.detail}</p></div></div>)}
                </div>
              )}
            </div>
            <span className="header-divider" />
            <div className="header-popover-wrap">
              <button className="profile-button" onClick={() => { setProfileOpen((value) => !value); setNotificationsOpen(false); }} aria-expanded={profileOpen}>
                <span className="avatar">A</span><span>Alex</span><ChevronDown size={16} />
              </button>
              {profileOpen && <div className="profile-popover"><button onClick={() => navigate('/health')}>Review My Health</button><button onClick={() => onDemoNavigate?.('Preferences opened.')}>Preferences</button></div>}
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
