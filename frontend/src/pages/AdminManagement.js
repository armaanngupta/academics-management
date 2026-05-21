import React, { useEffect, useState } from 'react';
import { adminAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import './AdminManagement.css';

const AdminManagement = () => {
  const { admin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
  });
  const [confirmState, setConfirmState] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.listAdmins();
      setAdmins(response.data.admins || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin?.role === 'superadmin') {
      fetchAdmins();
    }
  }, [admin]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await adminAPI.createAdmin({
        name: formData.name,
        username: formData.username,
        password: formData.password,
      });
      setSuccess('Admin created successfully.');
      setFormData({ name: '', username: '', password: '' });
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmState) return;
    setError('');
    setSuccess('');
    try {
      await adminAPI.deleteAdmin(confirmState.id);
      setSuccess('Admin deleted successfully.');
      setConfirmState(null);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete admin');
    }
  };

  if (admin?.role !== 'superadmin') {
    return (
      <AppLayout>
        <div className="content-header">
          <div>
            <p className="eyebrow">Settings</p>
            <h1>Admin Management</h1>
            <p className="subtitle">Superadmin access required.</p>
          </div>
        </div>
        <div className="error-message">You do not have permission to view this page.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="content-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Admin Management</h1>
          <p className="subtitle">Create and manage admin accounts for Ayushi College.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="admin-grid">
        <div className="admin-card">
          <h2>Create Admin</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <label>
              Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
              />
            </label>
            <label>
              Username *
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Password *
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </label>
            <button type="submit" className="primary-btn">
              Create admin
            </button>
          </form>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Admins</h2>
            <span className="pill">{admins.length}</span>
          </div>
          {loading ? (
            <div className="loading">Loading admins...</div>
          ) : (
            <div className="admin-list">
              {admins.map((item) => (
                <div className="admin-row" key={item._id || item.username}>
                  <div>
                    <strong>{item.name || item.username}</strong>
                    <span>{item.username}</span>
                  </div>
                  <div className="admin-actions">
                    <span className={`role-pill ${item.role}`}>{item.role}</span>
                    {item.role !== 'superadmin' && (
                      <button
                        className="ghost-btn"
                        onClick={() =>
                          setConfirmState({
                            id: item._id,
                            username: item.username,
                            name: item.name || item.username,
                          })
                        }
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmState && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Remove admin</h3>
              <button className="ghost-btn" onClick={() => setConfirmState(null)}>
                Close
              </button>
            </div>
            <p className="modal-body">
              Are you sure you want to remove {confirmState.name}? This will revoke access immediately.
            </p>
            <div className="modal-actions">
              <button className="ghost-btn" onClick={() => setConfirmState(null)}>
                Cancel
              </button>
              <button className="primary-btn" onClick={handleDeleteConfirm}>
                Yes, remove
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default AdminManagement;
