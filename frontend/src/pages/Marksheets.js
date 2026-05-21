import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { marksheetAPI } from '../api';
import AppLayout from '../components/AppLayout';
import MarksheetForm from '../components/MarksheetForm';
import MarksheetList from '../components/MarksheetList';
import SearchBar from '../components/SearchBar';
import academicsData from '../data/academics.json';
import './Marksheets.css';

const defaultFilters = {
  academicYear: '',
  session: '',
  subject: '',
  degree: '',
  university: '',
  issued: '',
  addedFrom: '',
  addedTo: '',
};

const Marksheets = () => {
  const [marksheets, setMarksheets] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingMarksheet, setEditingMarksheet] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const navigate = useNavigate();

  const pageOptions = [10, 20, 25];
  const academicYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, index) => {
      const start = currentYear - index;
      const end = start + 1;
      return `${start}-${end}`;
    });
  }, []);

  const universities = useMemo(() => academicsData.universities || [], []);
  const selectedUniversity = useMemo(
    () => universities.find((uni) => uni.name === filters.university),
    [filters.university, universities]
  );

  const degreeOptions = useMemo(() => {
    if (selectedUniversity) {
      return selectedUniversity.degrees.map((degree) => degree.name);
    }

    const allDegrees = universities.flatMap((uni) => uni.degrees.map((degree) => degree.name));
    return Array.from(new Set(allDegrees));
  }, [selectedUniversity, universities]);

  const subjectOptions = useMemo(() => {
    if (selectedUniversity && filters.degree) {
      const degree = selectedUniversity.degrees.find((item) => item.name === filters.degree);
      return degree ? degree.subjects : [];
    }

    if (selectedUniversity) {
      const allSubjects = selectedUniversity.degrees.flatMap((degree) => degree.subjects);
      return Array.from(new Set(allSubjects));
    }

    const allSubjects = universities.flatMap((uni) =>
      uni.degrees.flatMap((degree) => degree.subjects)
    );
    return Array.from(new Set(allSubjects));
  }, [filters.degree, selectedUniversity, universities]);

  const sessionOptions = useMemo(() => {
    if (selectedUniversity) {
      return selectedUniversity.sessions;
    }

    const allSessions = universities.flatMap((uni) => uni.sessions);
    return Array.from(new Set(allSessions));
  }, [selectedUniversity, universities]);

  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: pageSize,
    };

    if (search) params.search = search;

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });

    return params;
  }, [filters, page, pageSize, search]);

  const fetchMarksheets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await marksheetAPI.getAllMarksheets(queryParams);
      setMarksheets(response.data.marksheets);
      setPages(response.data.pages);
      setTotal(response.data.total);
    } catch (err) {
      setError('Failed to fetch marksheets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarksheets();
  }, [queryParams]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => {
      if (field === 'university') {
        return {
          ...prev,
          university: value,
          degree: '',
          subject: '',
          session: '',
        };
      }

      if (field === 'degree') {
        return {
          ...prev,
          degree: value,
          subject: '',
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setSearch('');
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  const handlePageSizeChange = (event) => {
    const nextSize = parseInt(event.target.value, 10);
    setPageSize(nextSize);
    setPage(1);
  };

  const handleUpdateMarksheet = async (id, data) => {
    try {
      await marksheetAPI.updateMarksheet(id, data);
      setEditingMarksheet(null);
      setShowEditForm(false);
      fetchMarksheets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update marksheet');
    }
  };

  const handleDeleteMarksheet = async (id) => {
    if (window.confirm('Are you sure you want to delete this marksheet?')) {
      try {
        await marksheetAPI.deleteMarksheet(id);
        fetchMarksheets();
      } catch (err) {
        setError('Failed to delete marksheet');
      }
    }
  };

  const handleToggleIssued = async (id) => {
    try {
      await marksheetAPI.toggleIssuedStatus(id);
      fetchMarksheets();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const pageButtons = useMemo(() => {
    const visiblePages = [];
    const maxButtons = 5;
    let start = Math.max(page - 2, 1);
    let end = Math.min(start + maxButtons - 1, pages);

    if (end - start < maxButtons - 1) {
      start = Math.max(end - maxButtons + 1, 1);
    }

    for (let i = start; i <= end; i += 1) {
      visiblePages.push(i);
    }
    return visiblePages;
  }, [page, pages]);

  return (
    <AppLayout>
      <div className="content-header">
        <div>
          <p className="eyebrow">Marksheets</p>
          <h1>Marksheets Library</h1>
          <p className="subtitle">Search, filter, and manage all marksheets.</p>
        </div>
        <div className="header-actions">
          <span className="pill">Total: {total}</span>
          <button className="primary-btn" onClick={() => navigate('/create')}>
            Create marksheet
          </button>
        </div>
      </div>

      <div className="controls">
        <SearchBar onSearch={handleSearch} />
        <div className="filters-inline">
          <button className="ghost-btn" onClick={handleClearFilters}>
            Clear filters
          </button>
        </div>
      </div>

      <section className="filters-panel">
        <div className="filter-group">
          <label>Academic Year</label>
          <select
            value={filters.academicYear}
            onChange={(event) => handleFilterChange('academicYear', event.target.value)}
          >
            <option value="">All</option>
            {academicYearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Session</label>
          <select
            value={filters.session}
            onChange={(event) => handleFilterChange('session', event.target.value)}
          >
            <option value="">All</option>
            {sessionOptions.map((session) => (
              <option key={session} value={session}>
                {session}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Subject</label>
          <select
            value={filters.subject}
            onChange={(event) => handleFilterChange('subject', event.target.value)}
          >
            <option value="">All</option>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Degree</label>
          <select
            value={filters.degree}
            onChange={(event) => handleFilterChange('degree', event.target.value)}
          >
            <option value="">All</option>
            {degreeOptions.map((degree) => (
              <option key={degree} value={degree}>
                {degree}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>University</label>
          <select
            value={filters.university}
            onChange={(event) => handleFilterChange('university', event.target.value)}
          >
            <option value="">All</option>
            {universities.map((university) => (
              <option key={university.name} value={university.name}>
                {university.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Issued status</label>
          <select
            value={filters.issued}
            onChange={(event) => handleFilterChange('issued', event.target.value)}
          >
            <option value="">All</option>
            <option value="false">Unissued</option>
            <option value="true">Issued</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Added from</label>
          <input
            type="date"
            value={filters.addedFrom}
            onChange={(event) => handleFilterChange('addedFrom', event.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Added to</label>
          <input
            type="date"
            value={filters.addedTo}
            onChange={(event) => handleFilterChange('addedTo', event.target.value)}
          />
        </div>
      </section>

      {error && <div className="error-message">{error}</div>}

      {showEditForm && (
        <div className="edit-panel">
          <div className="edit-panel-header">
            <span className="pill">Editing marksheet</span>
            <button
              className="ghost-btn"
              onClick={() => {
                setEditingMarksheet(null);
                setShowEditForm(false);
              }}
            >
              Cancel edit
            </button>
          </div>
          <MarksheetForm
            onSubmit={(data) => handleUpdateMarksheet(editingMarksheet._id, data)}
            initialData={editingMarksheet}
            isEditing
          />
        </div>
      )}

      {loading ? (
        <div className="loading">Loading marksheets...</div>
      ) : (
        <MarksheetList
          marksheets={marksheets}
          onEdit={(marksheet) => {
            setEditingMarksheet(marksheet);
            setShowEditForm(true);
          }}
          onDelete={handleDeleteMarksheet}
          onToggleIssued={handleToggleIssued}
        />
      )}

      <div className="pagination">
        <div className="page-size">
          <span>Rows per page</span>
          <select value={pageSize} onChange={handlePageSizeChange}>
            {pageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
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
          <button
            className="ghost-btn"
            onClick={() => handlePageChange(Math.min(page + 1, pages))}
            disabled={page === pages}
          >
            Next
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Marksheets;
