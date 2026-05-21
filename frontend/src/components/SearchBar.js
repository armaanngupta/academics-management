import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="search-bar">
      <span className="search-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <input
        type="text"
        placeholder="Search by student name or roll number..."
        value={query}
        onChange={handleChange}
      />
      {query && (
        <button className="clear-btn" onClick={handleClear}>
          Clear
        </button>
      )}
    </div>
  );
};

export default SearchBar;
