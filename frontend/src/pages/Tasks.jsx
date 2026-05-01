import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Tasks() {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending'
  });
  const [loading, setLoading] = useState(true);

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
      
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/api/tasks`, { headers }),
        axios.get(`${API_URL}/api/projects`, { headers }),
        axios.get(`${API_URL}/api/users/available`, { headers })
      ]);
      
      if (tasksRes.data.success) {
        setTasks(tasksRes.data.tasks || []);
      } else if (Array.isArray(tasksRes.data)) {
        setTasks(tasksRes.data);
      } else {
        setTasks([]);
      }
      
      if (projectsRes.data.success) {
        setProjects(projectsRes.data.projects || []);
      } else if (Array.isArray(projectsRes.data)) {
        setProjects(projectsRes.data);
      } else {
        setProjects([]);
      }
      
      if (usersRes.data.success) {
        setUsers(usersRes.data.users || []);
      } else if (Array.isArray(usersRes.data)) {
        setUsers(usersRes.data);
      } else {
        setUsers([]);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.projectId || !formData.dueDate) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const taskData = {
        title: formData.title,
        description: formData.description,
        projectId: formData.projectId,
        assignedTo: formData.assignedTo || null,
        dueDate: formData.dueDate,
        priority: formData.priority,
        status: formData.status
      };
      
      if (editingTask) {
        await axios.put(`${API_URL}/api/tasks/${editingTask._id}`, taskData, { headers });
        toast.success('Task updated successfully');
      } else {
        await axios.post(`${API_URL}/api/tasks`, taskData, { headers });
        toast.success('Task created successfully');
      }
      
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
  try {
    const token = localStorage.getItem('token');
    const headers = { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log(`Updating task ${taskId} to status: ${newStatus}`);
    
    const response = await axios.patch(`${API_URL}/api/tasks/${taskId}/status`, 
      { status: newStatus },
      { headers }
    );
    
    console.log('Update response:', response.data);
    
    if (response.data.success) {
      toast.success(`Task marked as ${newStatus}`);
      // Force refresh the tasks list
      await fetchData();
    } else {
      toast.error(response.data.message || 'Failed to update status');
    }
  } catch (error) {
    console.error('Error updating status:', error);
    toast.error(error.response?.data?.message || 'Failed to update status');
  }
};

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.delete(`${API_URL}/api/tasks/${id}`, { headers });
        
        if (response.data.success) {
          toast.success(response.data.message || 'Task deleted successfully');
          fetchData();
        } else {
          toast.error(response.data.message || 'Failed to delete task');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      projectId: '',
      assignedTo: '',
      dueDate: '',
      priority: 'Medium',
      status: 'Pending'
    });
    setEditingTask(null);
  };

  const canEditTask = (task) => {
    return isAdmin || task.assignedBy?._id === user?._id || task.assignedTo?._id === user?._id;
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'Urgent':
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <div className="spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Tasks</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Task
        </button>
      </div>

      <div className="dashboard-grid">
        {['Pending', 'In Progress', 'Completed'].map(status => (
          <div key={status} className="card">
            <div className="task-column-header" style={{
              background: status === 'Pending' ? '#ffc107' : status === 'In Progress' ? '#17a2b8' : '#28a745',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '15px',
              color: 'white'
            }}>
              <h3 style={{ margin: 0 }}>{status}</h3>
            </div>
            
            {tasks.filter(task => task.status === status).map(task => (
              <div key={task._id} className="task-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ marginBottom: '5px' }}>{task.title}</h4>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                      Project: {task.project?.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                      Assigned to: {task.assignedTo?.name || 'Unassigned'}
                    </p>
                    {task.dueDate && (
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>
                        Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`status-badge ${getPriorityClass(task.priority)}`} style={{ marginBottom: '8px', display: 'inline-block' }}>
                      {task.priority}
                    </span>
                    <div style={{ marginTop: '8px' }}>
                      {task.status !== 'Completed' && (
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                          style={{ padding: '4px', fontSize: '12px', marginRight: '5px', borderRadius: '4px' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      )}
                      {canEditTask(task) && (
                        <button
                          onClick={() => handleDelete(task._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', fontSize: '18px', padding: '0 5px' }}
                          title="Delete task"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {tasks.filter(task => task.status === status).length === 0 && (
              <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>No tasks</p>
            )}
          </div>
        ))}
      </div>

      {/* Modal for Create/Edit Task */}
      {showModal && (
        <div className="modal-overlay" onClick={() => {
          setShowModal(false);
          resetForm();
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Enter task title"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Enter task description"
                />
              </div>
              
              <div className="form-group">
                <label>Project *</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Assign To</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Due Date *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn" onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Make sure this export exists at the end of the file
export default Tasks;