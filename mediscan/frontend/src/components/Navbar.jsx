import { NavLink, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

export default function Navbar() {
  const logout = useStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/dashboard" className="navbar-brand">
          🩺 Medi<span>Scan</span>
        </NavLink>
        <div className="navbar-links">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            📊 <span>Dashboard</span>
          </NavLink>
          <NavLink to="/scanner" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            📷 <span>Scanner</span>
          </NavLink>
          <NavLink to="/community" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            💬 <span>Community</span>
          </NavLink>
          <NavLink to="/profile-setup" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            👤 <span>Profile</span>
          </NavLink>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>Sign Out</button>
        </div>
      </div>
    </nav>
  );
}
