import React, { useEffect, useMemo, useState } from 'react';
import { academicAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import './AcademicManagement.css';

const emptyAcademics = { universities: [] };

const cloneAcademics = (data) => ({
  universities: (data.universities || []).map((university) => ({
    ...university,
    sessions: [...(university.sessions || [])],
    degrees: (university.degrees || []).map((degree) => ({
      ...degree,
      subjects: [...(degree.subjects || [])],
    })),
  })),
});

const AcademicManagement = () => {
  const { admin } = useAuth();
  const [academics, setAcademics] = useState(emptyAcademics);
  const [selectedUniversityIndex, setSelectedUniversityIndex] = useState(0);
  const [selectedDegreeIndex, setSelectedDegreeIndex] = useState(0);
  const [forms, setForms] = useState({
    university: '',
    session: '',
    degree: '',
    subject: '',
  });
  const [editState, setEditState] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const universities = useMemo(() => academics.universities || [], [academics]);
  const selectedUniversity = universities[selectedUniversityIndex] || null;
  const degrees = selectedUniversity?.degrees || [];
  const selectedDegree = degrees[selectedDegreeIndex] || null;

  const counts = useMemo(() => {
    const universityCount = universities.length;
    const degreeCount = universities.reduce((total, university) => total + (university.degrees || []).length, 0);
    const subjectCount = universities.reduce(
      (total, university) =>
        total + (university.degrees || []).reduce((sum, degree) => sum + (degree.subjects || []).length, 0),
      0
    );

    return { universityCount, degreeCount, subjectCount };
  }, [universities]);

  const fetchAcademics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await academicAPI.getAll();
      setAcademics(response.data || emptyAcademics);
      setSelectedUniversityIndex(0);
      setSelectedDegreeIndex(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load academic data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      fetchAcademics();
    }
  }, [admin]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForms((prev) => ({ ...prev, [name]: value }));
  };

  const persistAcademics = async (nextAcademics, message, nextSelection = {}) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await academicAPI.updateAll(nextAcademics);
      setAcademics(response.data || nextAcademics);
      if (typeof nextSelection.universityIndex === 'number') {
        setSelectedUniversityIndex(nextSelection.universityIndex);
      }
      if (typeof nextSelection.degreeIndex === 'number') {
        setSelectedDegreeIndex(nextSelection.degreeIndex);
      }
      setSuccess(message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save academic data');
    } finally {
      setSaving(false);
    }
  };

  const addUniversity = async (event) => {
    event.preventDefault();
    const name = forms.university.trim();
    if (!name) return;

    const nextAcademics = cloneAcademics(academics);
    nextAcademics.universities.push({ name, sessions: [], degrees: [] });
    setForms((prev) => ({ ...prev, university: '' }));
    await persistAcademics(nextAcademics, 'University added.', {
      universityIndex: nextAcademics.universities.length - 1,
      degreeIndex: 0,
    });
  };

  const addSession = async (event) => {
    event.preventDefault();
    const name = forms.session.trim();
    if (!name || !selectedUniversity) return;

    const nextAcademics = cloneAcademics(academics);
    nextAcademics.universities[selectedUniversityIndex].sessions.push(name);
    setForms((prev) => ({ ...prev, session: '' }));
    await persistAcademics(nextAcademics, 'Session added.');
  };

  const addDegree = async (event) => {
    event.preventDefault();
    const name = forms.degree.trim();
    if (!name || !selectedUniversity) return;

    const nextAcademics = cloneAcademics(academics);
    nextAcademics.universities[selectedUniversityIndex].degrees.push({ name, subjects: [] });
    setForms((prev) => ({ ...prev, degree: '' }));
    await persistAcademics(nextAcademics, 'Degree added.', {
      degreeIndex: nextAcademics.universities[selectedUniversityIndex].degrees.length - 1,
    });
  };

  const addSubject = async (event) => {
    event.preventDefault();
    const name = forms.subject.trim();
    if (!name || !selectedUniversity || !selectedDegree) return;

    const nextAcademics = cloneAcademics(academics);
    nextAcademics.universities[selectedUniversityIndex].degrees[selectedDegreeIndex].subjects.push(name);
    setForms((prev) => ({ ...prev, subject: '' }));
    await persistAcademics(nextAcademics, 'Subject added.');
  };

  const openEdit = (kind, value, indexes) => {
    setEditState({ kind, value, indexes });
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    const value = editState?.value.trim();
    if (!editState || !value) return;

    const nextAcademics = cloneAcademics(academics);
    const { kind, indexes } = editState;

    if (kind === 'university') {
      nextAcademics.universities[indexes.universityIndex].name = value;
    }
    if (kind === 'session') {
      nextAcademics.universities[indexes.universityIndex].sessions[indexes.sessionIndex] = value;
    }
    if (kind === 'degree') {
      nextAcademics.universities[indexes.universityIndex].degrees[indexes.degreeIndex].name = value;
    }
    if (kind === 'subject') {
      nextAcademics.universities[indexes.universityIndex].degrees[indexes.degreeIndex].subjects[indexes.subjectIndex] = value;
    }

    setEditState(null);
    await persistAcademics(nextAcademics, 'Academic data updated.');
  };

  const deleteItem = async () => {
    if (!confirmState) return;
    const nextAcademics = cloneAcademics(academics);
    const { kind, indexes } = confirmState;

    if (kind === 'university') {
      nextAcademics.universities.splice(indexes.universityIndex, 1);
      setConfirmState(null);
      await persistAcademics(nextAcademics, 'University deleted.', {
        universityIndex: Math.max(0, indexes.universityIndex - 1),
        degreeIndex: 0,
      });
      return;
    }

    if (kind === 'session') {
      nextAcademics.universities[indexes.universityIndex].sessions.splice(indexes.sessionIndex, 1);
    }
    if (kind === 'degree') {
      nextAcademics.universities[indexes.universityIndex].degrees.splice(indexes.degreeIndex, 1);
      setSelectedDegreeIndex(Math.max(0, indexes.degreeIndex - 1));
    }
    if (kind === 'subject') {
      nextAcademics.universities[indexes.universityIndex].degrees[indexes.degreeIndex].subjects.splice(indexes.subjectIndex, 1);
    }

    setConfirmState(null);
    await persistAcademics(nextAcademics, 'Academic data deleted.');
  };

  return (
    <AppLayout>
      <div className="content-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Academic Data</h1>
          <p className="subtitle">Universities, sessions, degrees, and subjects.</p>
        </div>
        <div className="academic-stats">
          <span className="pill">{counts.universityCount} universities</span>
          <span className="pill">{counts.degreeCount} degrees</span>
          <span className="pill">{counts.subjectCount} subjects</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="academic-grid">
        <section className="academic-panel">
          <div className="academic-panel-header">
            <h2>Universities</h2>
            {saving && <span className="saving-text">Saving...</span>}
          </div>
          <form className="compact-form" onSubmit={addUniversity}>
            <input
              type="text"
              name="university"
              value={forms.university}
              onChange={handleFormChange}
              placeholder="University name"
            />
            <button className="primary-btn" type="submit" disabled={saving}>Add</button>
          </form>

          {loading ? (
            <div className="loading">Loading academic data...</div>
          ) : (
            <div className="stack-list">
              {universities.map((university, index) => (
                <div
                  className={`stack-row${index === selectedUniversityIndex ? ' is-selected' : ''}`}
                  key={`${university.name}-${index}`}
                >
                  <button
                    className="row-main"
                    type="button"
                    onClick={() => {
                      setSelectedUniversityIndex(index);
                      setSelectedDegreeIndex(0);
                    }}
                  >
                    <strong>{university.name}</strong>
                    <span>{(university.degrees || []).length} degrees</span>
                  </button>
                  <button className="ghost-btn" type="button" onClick={() => openEdit('university', university.name, { universityIndex: index })}>
                    Edit
                  </button>
                  <button className="ghost-btn danger" type="button" onClick={() => setConfirmState({ kind: 'university', label: university.name, indexes: { universityIndex: index } })}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="academic-panel">
          <div className="academic-panel-header">
            <h2>Sessions</h2>
            <span className="muted-label">{selectedUniversity?.name || 'No university'}</span>
          </div>
          <form className="compact-form" onSubmit={addSession}>
            <input
              type="text"
              name="session"
              value={forms.session}
              onChange={handleFormChange}
              placeholder="Session name"
              disabled={!selectedUniversity}
            />
            <button className="primary-btn" type="submit" disabled={!selectedUniversity || saving}>Add</button>
          </form>
          <div className="chip-list">
            {(selectedUniversity?.sessions || []).map((session, index) => (
              <div className="editable-chip" key={`${session}-${index}`}>
                <span>{session}</span>
                <button type="button" onClick={() => openEdit('session', session, { universityIndex: selectedUniversityIndex, sessionIndex: index })}>Edit</button>
                <button type="button" onClick={() => setConfirmState({ kind: 'session', label: session, indexes: { universityIndex: selectedUniversityIndex, sessionIndex: index } })}>Delete</button>
              </div>
            ))}
          </div>
        </section>

        <section className="academic-panel">
          <div className="academic-panel-header">
            <h2>Degrees</h2>
            <span className="muted-label">{selectedUniversity?.name || 'No university'}</span>
          </div>
          <form className="compact-form" onSubmit={addDegree}>
            <input
              type="text"
              name="degree"
              value={forms.degree}
              onChange={handleFormChange}
              placeholder="Degree name"
              disabled={!selectedUniversity}
            />
            <button className="primary-btn" type="submit" disabled={!selectedUniversity || saving}>Add</button>
          </form>
          <div className="stack-list">
            {degrees.map((degree, index) => (
              <div className={`stack-row${index === selectedDegreeIndex ? ' is-selected' : ''}`} key={`${degree.name}-${index}`}>
                <button className="row-main" type="button" onClick={() => setSelectedDegreeIndex(index)}>
                  <strong>{degree.name}</strong>
                  <span>{(degree.subjects || []).length} subjects</span>
                </button>
                <button className="ghost-btn" type="button" onClick={() => openEdit('degree', degree.name, { universityIndex: selectedUniversityIndex, degreeIndex: index })}>
                  Edit
                </button>
                <button className="ghost-btn danger" type="button" onClick={() => setConfirmState({ kind: 'degree', label: degree.name, indexes: { universityIndex: selectedUniversityIndex, degreeIndex: index } })}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="academic-panel">
          <div className="academic-panel-header">
            <h2>Subjects</h2>
            <span className="muted-label">{selectedDegree?.name || 'No degree'}</span>
          </div>
          <form className="compact-form" onSubmit={addSubject}>
            <input
              type="text"
              name="subject"
              value={forms.subject}
              onChange={handleFormChange}
              placeholder="Subject name"
              disabled={!selectedDegree}
            />
            <button className="primary-btn" type="submit" disabled={!selectedDegree || saving}>Add</button>
          </form>
          <div className="chip-list">
            {(selectedDegree?.subjects || []).map((subject, index) => (
              <div className="editable-chip" key={`${subject}-${index}`}>
                <span>{subject}</span>
                <button type="button" onClick={() => openEdit('subject', subject, { universityIndex: selectedUniversityIndex, degreeIndex: selectedDegreeIndex, subjectIndex: index })}>Edit</button>
                <button type="button" onClick={() => setConfirmState({ kind: 'subject', label: subject, indexes: { universityIndex: selectedUniversityIndex, degreeIndex: selectedDegreeIndex, subjectIndex: index } })}>Delete</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {editState && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <form className="modal-card" onSubmit={saveEdit}>
            <div className="modal-header">
              <h3>Edit {editState.kind}</h3>
              <button className="ghost-btn" type="button" onClick={() => setEditState(null)}>Close</button>
            </div>
            <label className="modal-field">
              Name
              <input
                type="text"
                value={editState.value}
                onChange={(event) => setEditState((prev) => ({ ...prev, value: event.target.value }))}
                autoFocus
                required
              />
            </label>
            <div className="modal-actions">
              <button className="ghost-btn" type="button" onClick={() => setEditState(null)}>Cancel</button>
              <button className="primary-btn" type="submit" disabled={saving}>Save</button>
            </div>
          </form>
        </div>
      )}

      {confirmState && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Delete {confirmState.kind}</h3>
              <button className="ghost-btn" type="button" onClick={() => setConfirmState(null)}>Close</button>
            </div>
            <p className="modal-body">Delete {confirmState.label}? Existing marksheet records will keep their saved text values.</p>
            <div className="modal-actions">
              <button className="ghost-btn" type="button" onClick={() => setConfirmState(null)}>Cancel</button>
              <button className="primary-btn" type="button" onClick={deleteItem} disabled={saving}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default AcademicManagement;
