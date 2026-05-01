import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, isAfter, differenceInDays } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ✅ FIXED: Remove /api from the end
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login first');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      // ✅ FIXED: Use correct API paths with /api prefix
      const [projectsRes, tasksRes] = await Promise.all([
        axios.get(`${API_URL}/api/projects`, { headers }),
        axios.get(`${API_URL}/api/tasks`, { headers })
      ]);
      
      // ✅ Handle different response formats
      let projectsData = projectsRes.data.projects || projectsRes.data || [];
      let tasksData = tasksRes.data.tasks || tasksRes.data || [];
      
      setProjects(projectsData);
      setTasks(tasksData);
      
      const now = new Date();
      
      // Calculate overdue tasks (tasks not completed and due date passed)
      const overdue = tasksData.filter(task => 
        task.status !== 'Completed' && task.dueDate && isAfter(now, new Date(task.dueDate))
      );
      
      // Calculate all statistics
      setStats({
        totalProjects: projectsData.length,
        totalTasks: tasksData.length,
        completedTasks: tasksData.filter(t => t.status === 'Completed').length,
        pendingTasks: tasksData.filter(t => t.status === 'Pending').length,
        inProgressTasks: tasksData.filter(t => t.status === 'In Progress').length,
        overdueTasks: overdue.length
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px', color: 'white' }}>Dashboard</h1>
      
      {/* Welcome Card */}
      <div className="card" style={{ 
        marginBottom: '30px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white',
        padding: '25px'
      }}>
        <h2 style={{ marginBottom: '10px' }}>Welcome back, {user?.name}! 👋</h2>
        <p>Track your progress and manage your tasks efficiently.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="dashboard-grid">
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>📁 Total Projects</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>{stats.totalProjects}</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>✅ Total Tasks</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>{stats.totalTasks}</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>🎉 Completed Tasks</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981' }}>{stats.completedTasks}</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>⚠️ Overdue Tasks</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#ef4444' }}>{stats.overdueTasks}</p>
        </div>
      </div>

      {/* Tasks by Status */}
      <div className="dashboard-grid" style={{ marginTop: '30px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '15px', color: '#f59e0b' }}>⏳ Pending Tasks ({stats.pendingTasks})</h3>
          {getTasksByStatus('Pending').map(task => (
            <div key={task._id} style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ fontWeight: '500', marginBottom: '5px' }}>{task.title}</p>
              <small style={{ color: '#6b7280' }}>
                Project: {task.project?.name || 'N/A'} | Due: {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No due date'}
              </small>
            </div>
          ))}
          {getTasksByStatus('Pending').length === 0 && (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>No pending tasks</p>
          )}
        </div>
        
        <div className="card">
          <h3 style={{ marginBottom: '15px', color: '#3b82f6' }}>🔄 In Progress ({stats.inProgressTasks})</h3>
          {getTasksByStatus('In Progress').map(task => (
            <div key={task._id} style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ fontWeight: '500', marginBottom: '5px' }}>{task.title}</p>
              <small style={{ color: '#6b7280' }}>
                Project: {task.project?.name || 'N/A'} | Due: {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No due date'}
              </small>
            </div>
          ))}
          {getTasksByStatus('In Progress').length === 0 && (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>No tasks in progress</p>
          )}
        </div>
        
        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>📋 Recent Projects</h3>
          {projects.slice(0, 5).map(project => (
            <div key={project._id} style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ fontWeight: '500', marginBottom: '5px' }}>{project.name}</p>
              <small style={{ color: '#6b7280' }}>
                Status: <span className={`status-badge status-${project.status?.toLowerCase() || 'active'}`}>
                  {project.status || 'Active'}
                </span>
              </small>
            </div>
          ))}
          {projects.length === 0 && (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>No projects yet. Create your first project!</p>
          )}
        </div>
      </div>
      
      {/* Completed Tasks Section */}
      {stats.completedTasks > 0 && (
        <div className="card" style={{ marginTop: '30px' }}>
          <h3 style={{ marginBottom: '15px', color: '#10b981' }}>✅ Recently Completed Tasks</h3>
          {tasks.filter(t => t.status === 'Completed').slice(0, 5).map(task => (
            <div key={task._id} style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ fontWeight: '500', marginBottom: '5px' }}>{task.title}</p>
              <small style={{ color: '#6b7280' }}>
                Project: {task.project?.name || 'N/A'} | Completed: {task.updatedAt ? format(new Date(task.updatedAt), 'MMM dd, yyyy') : 'Recently'}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;