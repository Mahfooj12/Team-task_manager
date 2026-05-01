import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">Team Task Manager</Link>
        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/tasks">Tasks</Link>
          <div className="user-section">
            <span className="user-name">{user?.name}</span>
            {isAdmin && <span className="admin-badge">Admin</span>}
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;