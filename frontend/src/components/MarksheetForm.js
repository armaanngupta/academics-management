import React, { useState, useEffect, useMemo } from 'react';
import { academicAPI } from '../api';
import StudentAutocomplete from './StudentAutocomplete';
import './MarksheetForm.css';

const emptyAcademicData = { universities: [] };

const MarksheetForm = ({ onSubmit, initialData, isEditing }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    enrollmentNumber: '',
    rollNumber: '',
    marksheetNumber: '',
    academicYear: '',
    session: '',
    subject: '',
    degree: '',
    university: '',
    type: 'regular',
    result: 'pass',
    remarks: '',
  });
  const [academicData, setAcademicData] = useState(emptyAcademicData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        studentName: initialData.studentName || initialData.name || '',
        enrollmentNumber: initialData.enrollmentNumber || '',
        rollNumber: initialData.rollNumber || '',
        marksheetNumber: initialData.marksheetNumber || '',
        academicYear: initialData.academicYear || '',
        session: initialData.session || '',
        subject: initialData.subject || '',
        degree: initialData.degree || '',
        university: initialData.university || '',
        type: initialData.type || 'regular',
        result: initialData.result || 'pass',
        remarks: initialData.remarks || initialData.description || '',
      });
    }
  }, [initialData]);

  useEffect(() => {
    let isMounted = true;

    const fetchAcademicData = async () => {
      try {
        const response = await academicAPI.getAll();
        if (isMounted) {
          setAcademicData(response.data || emptyAcademicData);
        }
      } catch (error) {
        if (isMounted) {
          setAcademicData(emptyAcademicData);
        }
      }
    };

    fetchAcademicData();

    return () => {
      isMounted = false;
    };
  }, []);

  const academicYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, index) => {
      const start = currentYear - index;
      return `${start}-${start + 1}`;
    });
  }, []);

  const universities = useMemo(() => academicData.universities || [], [academicData]);
  const selectedUniversity = useMemo(
    () => universities.find((uni) => uni.name === formData.university),
    [formData.university, universities]
  );
  const degreeOptions = selectedUniversity?.degrees || [];
  const selectedDegree = degreeOptions.find((d) => d.name === formData.degree);
  const subjectOptions = selectedDegree?.subjects || [];
  const sessionOptions = selectedUniversity?.sessions || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'university') return { ...prev, university: value, degree: '', subject: '', session: '' };
      if (name === 'degree') return { ...prev, degree: value, subject: '' };
      return { ...prev, [name]: value };
    });
  };

  const handleStudentSelect = (student) => {
    setFormData((prev) => ({
      ...prev,
      studentName: student.name,
      enrollmentNumber: student.enrollmentNumber,
      university: student.university,
      degree: student.degree,
      subject: student.subject,
    }));
  };

  const emptyForm = {
    studentName: '',
    enrollmentNumber: '',
    rollNumber: '',
    marksheetNumber: '',
    academicYear: '',
    session: '',
    subject: '',
    degree: '',
    university: '',
    type: 'regular',
    result: 'pass',
    remarks: '',
  };

  const handleClear = () => setFormData(emptyForm);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    if (!isEditing) setFormData(emptyForm);
  };

  return (
    <div className="form-container">
      <h2>{isEditing ? 'Edit Marksheet' : 'Add New Marksheet'}</h2>
      <p className="form-note">*All fields are required.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <StudentAutocomplete
            label="Student Name"
            name="studentName"
            value={formData.studentName}
            searchField="name"
            onChange={(val) => handleChange({ target: { name: 'studentName', value: val } })}
            onSelect={handleStudentSelect}
            required
            disabled={isEditing}
          />
          <StudentAutocomplete
            label="Enrollment Number"
            name="enrollmentNumber"
            value={formData.enrollmentNumber}
            searchField="enrollmentNumber"
            onChange={(val) => handleChange({ target: { name: 'enrollmentNumber', value: val } })}
            onSelect={handleStudentSelect}
            required
            disabled={isEditing}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Roll Number</label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Marksheet Number</label>
            <input
              type="text"
              name="marksheetNumber"
              value={formData.marksheetNumber}
              onChange={handleChange}
              required
              disabled={isEditing}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>University</label>
            <select name="university" value={formData.university} onChange={handleChange} required>
              <option value="">Select University</option>
              {universities.map((university) => (
                <option key={university.name} value={university.name}>{university.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Degree</label>
            <select name="degree" value={formData.degree} onChange={handleChange} required disabled={!formData.university}>
              <option value="">Select Degree</option>
              {degreeOptions.map((degree) => (
                <option key={degree.name} value={degree.name}>{degree.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Subject</label>
            <select name="subject" value={formData.subject} onChange={handleChange} required disabled={!formData.degree}>
              <option value="">Select Subject</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Session</label>
            <select name="session" value={formData.session} onChange={handleChange} required disabled={!formData.university}>
              <option value="">Select Session</option>
              {sessionOptions.map((session) => (
                <option key={session} value={session}>{session}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Academic Year</label>
            <select name="academicYear" value={formData.academicYear} onChange={handleChange} required>
              <option value="">Select Academic Year</option>
              {academicYearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="form-group" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Type</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="type"
                  value="regular"
                  checked={formData.type === 'regular'}
                  onChange={handleChange}
                />
                Regular
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="type"
                  value="backlog"
                  checked={formData.type === 'backlog'}
                  onChange={handleChange}
                />
                Backlog
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Result</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="result"
                  value="pass"
                  checked={formData.result === 'pass'}
                  onChange={handleChange}
                />
                Pass
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="result"
                  value="fail"
                  checked={formData.result === 'fail'}
                  onChange={handleChange}
                />
                Fail
              </label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Remarks (Optional)</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            rows="4"
            placeholder="Add remarks..."
          />
        </div>

        <div className="form-actions">
          <button type="button" className="clear-form-btn" onClick={handleClear}>
            Clear
          </button>
          <button type="submit" className="submit-btn">
            {isEditing ? 'Update Marksheet' : 'Add Marksheet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarksheetForm;
