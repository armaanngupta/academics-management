import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import { useNavigate } from 'react-router-dom';
import useTheme from '../hooks/useTheme';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(username, password);
      login(response.data.token, response.data.admin);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-container app-page"
      style={{ '--login-bg': `url(${process.env.PUBLIC_URL}/bg.webp)` }}
    >
      <div className="login-shell">
        <div className="login-panel">
          <div className="login-brand">
            <span className="brand-badge" aria-hidden="true">
              <img className="logo-image" src="/logo.png" alt="Ayushi College logo" />
            </span>
            <div>
              <h1>Ayushi College</h1>
              <p className="brand-subtitle">Keep academic records organized and audit-ready.</p>
            </div>
          </div>
          <div className="login-highlights">
            <div className="highlight-card">
              <h3>Track issuance</h3>
              <p>Toggle marksheet status and keep the team aligned.</p>
            </div>
            <div className="highlight-card">
              <h3>Search instantly</h3>
              <p>Find any record by roll number or student name.</p>
            </div>
            <div className="highlight-card">
              <h3>Stay secure</h3>
              <p>Admin-only access keeps records protected.</p>
            </div>
          </div>
        </div>

        <div className="login-box">
          <div className="login-top-actions">
            <button className="ghost-btn theme-toggle" onClick={toggleTheme} type="button">
              <span className="theme-toggle-indicator" aria-hidden="true" />
              {theme === 'dark' ? 'Dark' : 'Light'}
            </button>
          </div>
          <div className="login-header">
            <h2>Sign in</h2>
            <p className="login-copy">Use your admin credentials to continue.</p>
          </div>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="default-creds">Use your assigned admin credentials.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
