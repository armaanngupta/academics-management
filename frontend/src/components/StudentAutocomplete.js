import React, { useState, useEffect, useRef, useCallback } from 'react';
import { studentAPI } from '../api';

const StudentAutocomplete = ({ label, name, value, searchField, onChange, onSelect, required, disabled }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  const fetchSuggestions = useCallback(
    async (query) => {
      if (!query || query.trim().length < 1) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }
      try {
        const res = await studentAPI.search(query.trim(), searchField);
        const students = res.data.students || [];
        setSuggestions(students);
        setIsOpen(students.length > 0);
        setHighlighted(-1);
      } catch {
        setSuggestions([]);
        setIsOpen(false);
      }
    },
    [searchField]
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = (student) => {
    onSelect(student);
    setSuggestions([]);
    setIsOpen(false);
    setHighlighted(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const idx = highlighted >= 0 ? highlighted : suggestions.length === 1 ? 0 : -1;
      if (idx >= 0) handleSelect(suggestions[idx]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlighted(-1);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setHighlighted(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return (
    <div className="form-group" ref={containerRef}>
      <label>{label}</label>
      <div className="ac-input-wrapper">
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          required={required}
          disabled={disabled}
          autoComplete="off"
        />
        {isOpen && suggestions.length > 0 && (
          <ul className="autocomplete-dropdown">
            {suggestions.map((student, idx) => (
              <li
                key={student.rollNumber}
                className={`autocomplete-item${highlighted === idx ? ' highlighted' : ''}`}
                onMouseDown={() => handleSelect(student)}
                onMouseEnter={() => setHighlighted(idx)}
              >
                <span className="ac-primary">
                  {searchField === 'name' ? student.name : student.enrollmentNumber}
                </span>
                <span className="ac-secondary">
                  {searchField === 'name' ? student.enrollmentNumber : student.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudentAutocomplete;
