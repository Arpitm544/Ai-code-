import React from 'react';
import { FaPlus, FaUserCircle } from 'react-icons/fa';

const TopBar = ({ search, setSearch, onNewProject }) => {
  // Get username from localStorage
  const username = localStorage.getItem('username') || 'User';

  return (
    <header className="topbar">
      <div className="topbar-left"></div>
      <div className="topbar-center">
        <input
          type="text"
          className="search-input"
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="new-project-btn" onClick={onNewProject}>
          <FaPlus /> New Project
        </button>
        <span className="user-greeting" style={{ marginLeft: '1.5rem' }}>Hi, {username}</span>
        <FaUserCircle className="user-avatar" />
      </div>
    </header>
  );
};

export default TopBar; 