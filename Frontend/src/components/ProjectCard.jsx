import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookmarks } from '../context/BookmarkContext';
import CommentSection from './CommentSection';

const getBadgeColor = (score) => {
  if (score >= 80) return 'green';
  if (score >= 70) return 'gold';
  return 'orange';
};

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const { bookmarks, addBookmark, removeBookmark } = useBookmarks();
  const isBookmarked = bookmarks.some(b => b.id === project.id);

  const handleOpenEditor = () => {
    navigate('/code-review', { state: { project } });
  };

  return (
    <div className="project-card">
      <div className="project-header">
        <span className="project-title">{project.name}</span>
        <span className="project-lang">{project.language}</span>
      </div>
      <div className="project-meta">
        <span className={`health-badge ${getBadgeColor(project.healthScore)}`}>{project.healthScore}</span>
        <span className="project-updated">Updated {project.updated}</span>
      </div>
      <button className="open-editor-btn" onClick={handleOpenEditor}>Open Editor</button>
      <button
        className="bookmark-btn"
        onClick={() => isBookmarked ? removeBookmark(project.id) : addBookmark(project)}
        style={{ marginTop: '0.5rem' }}
      >
        {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
      </button>
      <CommentSection projectId={project.id} username={localStorage.getItem('username') || 'User'} />
    </div>
  );
};

export default ProjectCard; 