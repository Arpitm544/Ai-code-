import React from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import ProjectCard from '../components/ProjectCard';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';

const Dashboard = () => {
  const { projects } = useProjects();
  const [search, setSearch] = React.useState('');
  const navigate = useNavigate();

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <TopBar search={search} setSearch={setSearch} onNewProject={() => navigate('/code-review')} />
        <div className="dashboard-content">
          <h2>My Projects</h2>
          <div className="project-grid">
            {filteredProjects.length === 0 ? (
              <div style={{color: 'var(--text-secondary)', fontSize: '1.1rem'}}>No projects yet. Add one from Code Review!</div>
            ) : (
              filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 