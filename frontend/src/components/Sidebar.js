import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard', exact: true, icon: '🏠' },
  { to: '/compose', label: 'New message', icon: '✏️' },
  { to: '/contacts', label: 'Contacts', icon: '👥' },
  { to: '/messages', label: 'Scheduled', icon: '📅' },
  { to: '/logs', label: 'Send history', icon: '📋' },
  { to: '/whatsapp', label: 'WhatsApp', icon: '💬' },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const initials = user?.last_name?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>SmartMsg</h1>
        <p>Automated WhatsApp sender</p>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(({ to, label, icon, exact }) => (
          <NavLink key={to} to={to} end={exact} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="user-tag">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <p>{user?.last_name}</p>
            <span>{user?.phone}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={() => { signOut(); navigate('/login'); }}>Sign out</button>
      </div>
    </div>
  );
}
