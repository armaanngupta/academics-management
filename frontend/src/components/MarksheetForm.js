import React, { useState, useEffect, useMemo } from 'react';
import academicsData from '../data/academics.json';
import './MarksheetForm.css';

const MarksheetForm = ({ onSubmit, initialData, isEditing }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    academicYear: '',
    session: '',
    subject: '',
    degree: '',
    university: '',
    remarks: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        studentName: initialData.studentName || '',
        rollNumber: initialData.rollNumber || '',
        academicYear: initialData.academicYear || '',
        session: initialData.session || '',
        subject: initialData.subject || '',
        degree: initialData.degree || '',
        university: initialData.university || '',
        remarks: initialData.remarks || initialData.description || '',
      });
    }
  }, [initialData]);

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
    () => universities.find((uni) => uni.name === formData.university),
    [formData.university, universities]
  );
  const degreeOptions = selectedUniversity?.degrees || [];
  const selectedDegree = degreeOptions.find((degree) => degree.name === formData.degree);
  const subjectOptions = selectedDegree?.subjects || [];
  const sessionOptions = selectedUniversity?.sessions || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'university') {
        return {
          ...prev,
          university: value,
          degree: '',
          subject: '',
          session: '',
        };
      }

      if (name === 'degree') {
        return {
          ...prev,
          degree: value,
          subject: '',
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    if (!isEditing) {
      setFormData({
        studentName: '',
        rollNumber: '',
        academicYear: '',
        session: '',
        subject: '',
        degree: '',
        university: '',
        remarks: '',
      });
    }
  };

  return (
    <div className="form-container">
      <h2>{isEditing ? 'Edit Marksheet' : 'Add New Marksheet'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Student Name *</label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Roll Number *</label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              required
              disabled={isEditing}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>University *</label>
            <select name="university" value={formData.university} onChange={handleChange} required>
              <option value="">Select University</option>
              {universities.map((university) => (
                <option key={university.name} value={university.name}>
                  {university.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Degree *</label>
            <select
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              required
              disabled={!formData.university}
            >
              <option value="">Select Degree</option>
              {degreeOptions.map((degree) => (
                <option key={degree.name} value={degree.name}>
                  {degree.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Subject *</label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              disabled={!formData.degree}
            >
              <option value="">Select Subject</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Session *</label>
            <select
              name="session"
              value={formData.session}
              onChange={handleChange}
              required
              disabled={!formData.university}
            >
              <option value="">Select Session</option>
              {sessionOptions.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Academic Year *</label>
            <select name="academicYear" value={formData.academicYear} onChange={handleChange} required>
              <option value="">Select Academic Year</option>
              {academicYearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            rows="4"
            placeholder="Add optional remarks..."
          />
        </div>

        <button type="submit" className="submit-btn">
          {isEditing ? 'Update Marksheet' : 'Add Marksheet'}
        </button>
      </form>
    </div>
  );
};

export default MarksheetForm;
