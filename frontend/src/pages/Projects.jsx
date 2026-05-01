import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login first');
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Projects response:', response.data);
      
      if (response.data.success) {
        setProjects(response.data.projects || []);
      } else {
        setProjects([]);
        if (response.data.message) {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch projects');
      }
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!newProject.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/api/projects`, {
        name: newProject.name.trim(),
        description: newProject.description.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Create project response:', response.data);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Project created successfully!');
        setShowModal(false);
        setNewProject({ name: '', description: '' });
        fetchProjects(); // Refresh the list
      } else {
        toast.error(response.data.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (window.confirm(`Are you sure you want to delete "${projectName}"?`)) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.delete(`${API_URL}/api/projects/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          toast.success(response.data.message || 'Project deleted successfully');
          fetchProjects(); // Refresh the list
        } else {
          toast.error(response.data.message || 'Failed to delete project');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error(error.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <div className="spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
          <p>No projects yet. Create your first project!</p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <div key={project._id} className="card project-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{project.name}</h3>
                <button
                  onClick={() => handleDeleteProject(project._id, project.name)}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Delete
                </button>
              </div>
              <p>{project.description || 'No description'}</p>
              <div style={{ marginTop: '15px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '3px 8px',
                  borderRadius: '3px',
                  fontSize: '12px',
                  background: project.status === 'Active' ? '#28a745' : project.status === 'Completed' ? '#007bff' : '#ffc107',
                  color: 'white'
                }}>
                  {project.status || 'Active'}
                </span>
                <br />
                <small>Owner: {project.owner?.name || 'Unknown'}</small>
                {project.members?.length > 0 && (
                  <>
                    <br />
                    <small>Members: {project.members.length}</small>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for creating project */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                  placeholder="Enter project name"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows="3"
                  placeholder="Enter project description (optional)"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;