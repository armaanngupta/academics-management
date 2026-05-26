import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { academicAPI, studentAPI } from '../api';
import AppLayout from '../components/AppLayout';
import SearchBar from '../components/SearchBar';
import '../components/MarksheetList.css';
import './Marksheets.css';
import './Students.css';

const emptyAddForm = { name: '', enrollmentNumber: '', university: '', degree: '', subject: '' };

const Students = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [academicData, setAcademicData] = useState({ universities: [] });

  // Add student popup state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState(emptyAddForm);
  const [addFormError, setAddFormError] = useState('');
  const [enrollmentWarning, setEnrollmentWarning] = useState('');
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const enrollmentDebounceRef = useRef(null);

  const navigate = useNavigate();
  const pageOptions = [10, 20, 25];

  // Cascading academics for the add form
  const universities = useMemo(() => academicData.universities || [], [academicData]);
  const selectedUniversity = useMemo(
    () => universities.find((u) => u.name === addFormData.university),
    [addFormData.university, universities]
  );
  const degreeOptions = selectedUniversity?.degrees || [];
  const selectedDegree = degreeOptions.find((d) => d.name === addFormData.degree);
  const subjectOptions = selectedDegree?.subjects || [];

  const queryParams = useMemo(() => {
    const params = { page, limit: pageSize };
    if (search) params.q = search;
    return params;
  }, [page, pageSize, search]);

  useEffect(() => {
    let isMounted = true;

    const fetchAcademicData = async () => {
      try {
        const res = await academicAPI.getAll();
        if (isMounted) {
          setAcademicData(res.data || { universities: [] });
        }
      } catch {
        if (isMounted) {
          setAcademicData({ universities: [] });
        }
      }
    };

    fetchAcademicData();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchStudents = useCallback(async (params) => {
    setLoading(true);
    setError('');
    try {
      const res = await studentAPI.getAll(params);
      setStudents(res.data.students);
      setPages(res.data.pages);
      setTotal(res.data.total);
    } catch {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents(queryParams);
  }, [queryParams, fetchStudents]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (nextPage) => setPage(nextPage);

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value, 10));
    setPage(1);
  };

  const pageButtons = useMemo(() => {
    const visiblePages = [];
    const maxButtons = 5;
    let start = Math.max(page - 2, 1);
    let end = Math.min(start + maxButtons - 1, pages);
    if (end - start < maxButtons - 1) start = Math.max(end - maxButtons + 1, 1);
    for (let i = start; i <= end; i += 1) visiblePages.push(i);
    return visiblePages;
  }, [page, pages]);

  const handleCreateMarksheet = (student) => {
    navigate('/create', { state: { student } });
  };

  // Add student popup handlers
  const openAddForm = () => {
    setAddFormData(emptyAddForm);
    setAddFormError('');
    setEnrollmentWarning('');
    setShowAddForm(true);
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    setAddFormData(emptyAddForm);
    setAddFormError('');
    setEnrollmentWarning('');
    clearTimeout(enrollmentDebounceRef.current);
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => {
      if (name === 'university') return { ...prev, university: value, degree: '', subject: '' };
      if (name === 'degree') return { ...prev, degree: value, subject: '' };
      return { ...prev, [name]: value };
    });

    if (name === 'enrollmentNumber') {
      setEnrollmentWarning('');
      clearTimeout(enrollmentDebounceRef.current);
      if (!value.trim()) return;
      enrollmentDebounceRef.current = setTimeout(async () => {
        setCheckingEnrollment(true);
        try {
          const res = await studentAPI.checkEnrollment(value.trim());
          if (res.data.exists) {
            setEnrollmentWarning('This enrollment number is already registered.');
          }
        } catch {
          // silent — let the backend handle it on submit
        } finally {
          setCheckingEnrollment(false);
        }
      }, 400);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (enrollmentWarning) return;
    setAddFormError('');
    setSubmitting(true);
    try {
      await studentAPI.create(addFormData);
      closeAddForm();
      fetchStudents(queryParams);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create student';
      if (err.response?.status === 409) {
        setEnrollmentWarning(msg);
      } else {
        setAddFormError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="content-header">
        <div>
          <p className="eyebrow">Students</p>
          <h1>Students Directory</h1>
          <p className="subtitle">Browse registered students and create marksheets.</p>
        </div>
        <div className="header-actions">
          <span className="pill">Total: {total}</span>
          <button className="primary-btn" onClick={openAddForm}>
            Add Student
          </button>
        </div>
      </div>

      <div className="controls">
        <SearchBar onSearch={handleSearch} />
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <p>No students found. Add a student manually or create a marksheet to register one automatically.</p>
        </div>
      ) : (
        <div className="marksheet-list">
          <h2>Students ({students.length})</h2>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Enrollment No.</th>
                  <th>University</th>
                  <th>Degree</th>
                  <th>Subject</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.enrollmentNumber}</td>
                    <td>{student.university || '—'}</td>
                    <td>{student.degree || '—'}</td>
                    <td>{student.subject || '—'}</td>
                    <td className="actions">
                      <button className="edit-btn" onClick={() => handleCreateMarksheet(student)}>
                        Create Marksheet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="pagination">
        <div className="page-size">
          <span>Rows per page</span>
          <select value={pageSize} onChange={handlePageSizeChange}>
            {pageOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="page-buttons">
          <button className="ghost-btn" onClick={() => handlePageChange(Math.max(page - 1, 1))} disabled={page === 1}>
            Previous
          </button>
          {pageButtons.map((pageNumber) => (
            <button
              key={pageNumber}
              className={`ghost-btn${pageNumber === page ? ' is-active' : ''}`}
              onClick={() => handlePageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button className="ghost-btn" onClick={() => handlePageChange(Math.min(page + 1, pages))} disabled={page === pages}>
            Next
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={closeAddForm}>
          <div className="modal-card student-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Student</h3>
              <button className="ghost-btn" onClick={closeAddForm}>Close</button>
            </div>

            <form onSubmit={handleAddStudent} className="student-form">
              <p className="student-form-note">Name and enrollment number are required.</p>

              {addFormError && <p className="student-form-error">{addFormError}</p>}

              <div className="student-field">
                <label>Student Name</label>
                <input
                  type="text"
                  name="name"
                  value={addFormData.name}
                  onChange={handleAddFormChange}
                  required
                  placeholder="Full name"
                />
              </div>

              <div className="student-field">
                <label>Enrollment Number</label>
                <input
                  type="text"
                  name="enrollmentNumber"
                  value={addFormData.enrollmentNumber}
                  onChange={handleAddFormChange}
                  required
                  placeholder="Unique enrollment number"
                  className={enrollmentWarning ? 'field-error' : ''}
                />
                {checkingEnrollment && <span className="student-field-hint">Checking…</span>}
                {enrollmentWarning && <span className="student-field-warning">{enrollmentWarning}</span>}
              </div>

              <div className="student-field">
                <label>University <span className="optional">(optional)</span></label>
                <select name="university" value={addFormData.university} onChange={handleAddFormChange}>
                  <option value="">Select University</option>
                  {universities.map((u) => (
                    <option key={u.name} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="student-field">
                <label>Degree <span className="optional">(optional)</span></label>
                <select name="degree" value={addFormData.degree} onChange={handleAddFormChange} disabled={!addFormData.university}>
                  <option value="">Select Degree</option>
                  {degreeOptions.map((d) => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="student-field">
                <label>Subject <span className="optional">(optional)</span></label>
                <select name="subject" value={addFormData.subject} onChange={handleAddFormChange} disabled={!addFormData.degree}>
                  <option value="">Select Subject</option>
                  {subjectOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="ghost-btn" onClick={closeAddForm}>Cancel</button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={submitting || !!enrollmentWarning || checkingEnrollment}
                >
                  {submitting ? 'Saving…' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Students;
