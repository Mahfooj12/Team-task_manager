import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, isAfter, differenceInDays } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        axios.get(`${API_URL}/projects`),
        axios.get(`${API_URL}/tasks`)
      ]);
      
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
      
      const now = new Date();
      const overdue = tasksRes.data.filter(task => 
        task.status !== 'Completed' && isAfter(now, new Date(task.dueDate))
      );
      
      setStats({
        totalProjects: projectsRes.data.length,
        totalTasks: tasksRes.data.length,
        completedTasks: tasksRes.data.filter(t => t.status === 'Completed').length,
        overdueTasks: overdue.length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return <div className="spinner" style={{ margin: '100px auto' }}></div>;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px', color: 'white' }}>Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="dashboard-grid">
        <div className="card">
          <h3>Total Projects</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>{stats.totalProjects}</p>
        </div>
        <div className="card">
          <h3>Total Tasks</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>{stats.totalTasks}</p>
        </div>
        <div className="card">
          <h3>Completed Tasks</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981' }}>{stats.completedTasks}</p>
        </div>
        <div className="card">
          <h3>Overdue Tasks</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#ef4444' }}>{stats.overdueTasks}</p>
        </div>
      </div>

      {/* Tasks by Status */}
      <div className="dashboard-grid" style={{ marginTop: '30px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>Pending Tasks</h3>
          {getTasksByStatus('Pending').map(task => (
            <div key={task._id} style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ fontWeight: '500' }}>{task.title}</p>
              <small style={{ color: '#6b7280' }}>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</small>
            </div>
          ))}
          {getTasksByStatus('Pending').length === 0 && <p>No pending tasks</p>}
        </div>
        
        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>In Progress</h3>
          {getTasksByStatus('In Progress').map(task => (
            <div key={task._id} style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ fontWeight: '500' }}>{task.title}</p>
              <small style={{ color: '#6b7280' }}>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</small>
            </div>
          ))}
          {getTasksByStatus('In Progress').length === 0 && <p>No tasks in progress</p>}
        </div>
        
        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>Recent Projects</h3>
          {projects.slice(0, 5).map(project => (
            <div key={project._id} style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ fontWeight: '500' }}>{project.name}</p>
              <small style={{ color: '#6b7280' }}>Status: {project.status}</small>
            </div>
          ))}
          {projects.length === 0 && <p>No projects yet</p>}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;