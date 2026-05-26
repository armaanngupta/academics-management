import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useTheme from '../hooks/useTheme';
import './AppLayout.css';

const AppLayout = ({ children }) => {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard app-page">
      <header className="topbar">
        <div className="topbar-left">
          <div className="app-badge">
            <img className="logo-image" src="/logo.png" alt="Ayushi College logo" />
          </div>
          <div className="app-title">
            <span className="app-name">Ayushi College</span>
            <span className="app-divider" />
            <span className="app-project">Academics</span>
          </div>
        </div>
        <div className="topbar-right">
          <button className="ghost-btn theme-toggle" onClick={toggleTheme} type="button">
            <span className="theme-toggle-indicator" aria-hidden="true" />
            {theme === 'dark' ? 'Dark' : 'Light'}
          </button>
          <span className="pill">Admin: {admin?.username}</span>
          <button className="ghost-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-section">
            <p className="sidebar-label">Navigation</p>
            <NavLink className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`} to="/dashboard">
              Dashboard
            </NavLink>
            <NavLink className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`} to="/create">
              Create
            </NavLink>
            <NavLink className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`} to="/marksheets">
              Marksheets
            </NavLink>
            <NavLink className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`} to="/students">
              Students
            </NavLink>
            <NavLink
              className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}
              to="/settings/academics"
            >
              Academic Data
            </NavLink>
            {admin?.role === 'superadmin' && (
              <NavLink
                className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}
                to="/settings/admins"
              >
                Admin Management
              </NavLink>
            )}
          </div>
        </aside>

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
