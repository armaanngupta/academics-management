import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { marksheetAPI } from '../api';
import AppLayout from '../components/AppLayout';
import MarksheetForm from '../components/MarksheetForm';
import './CreateMarksheet.css';

const CreateMarksheet = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const prefillStudent = location.state?.student || null;

  const handleAddMarksheet = async (data) => {
    setError('');
    setSuccess('');
    try {
      await marksheetAPI.addMarksheet(data);
      setSuccess('Marksheet created successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add marksheet');
    }
  };

  return (
    <AppLayout>
      <div className="content-header">
        <div>
          <p className="eyebrow">Marksheets</p>
          <h1>Create Marksheet</h1>
          <p className="subtitle">Add a new marksheet record for Ayushi College.</p>
        </div>
        <button className="ghost-btn" onClick={() => navigate('/marksheets')}>
          View marksheets
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="create-card">
        <MarksheetForm onSubmit={handleAddMarksheet} initialData={prefillStudent} />
      </div>
    </AppLayout>
  );
};

export default CreateMarksheet;
