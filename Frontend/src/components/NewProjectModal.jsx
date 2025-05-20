import React, { useState } from 'react';

const NewProjectModal = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [healthScore, setHealthScore] = useState(80);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    onAdd({ name, language, healthScore, updated: 'just now' });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>New Project</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>Project Name</label>
          <input value={name} onChange={e => setName(e.target.value)} required />
          <label>Language</label>
          <select value={language} onChange={e => setLanguage(e.target.value)}>
            <option>JavaScript</option>
            <option>Python</option>
            <option>React</option>
            <option>SQL</option>
          </select>
          <label>Health Score</label>
          <input type="number" min="0" max="100" value={healthScore} onChange={e => setHealthScore(Number(e.target.value))} required />
          <div className="modal-actions">
            <button type="submit">Add Project</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal; 