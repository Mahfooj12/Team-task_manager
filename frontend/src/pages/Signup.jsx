import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const success = await signup(name.trim(), email.trim().toLowerCase(), password);
      
      if (success) {
        toast.success('Welcome! Redirecting to dashboard...');
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (error) {
      console.error('Signup component error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '30px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Create Account
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              required
              placeholder="Enter your name"
              style={{ borderColor: errors.name ? '#dc3545' : '' }}
            />
            {errors.name && <small style={{ color: '#dc3545' }}>{errors.name}</small>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              required
              placeholder="Enter your email"
              style={{ borderColor: errors.email ? '#dc3545' : '' }}
            />
            {errors.email && <small style={{ color: '#dc3545' }}>{errors.email}</small>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              required
              placeholder="Enter password (min 6 characters)"
              minLength={6}
              style={{ borderColor: errors.password ? '#dc3545' : '' }}
            />
            {errors.password && <small style={{ color: '#dc3545' }}>{errors.password}</small>}
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
              Password must be at least 6 characters
            </small>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;