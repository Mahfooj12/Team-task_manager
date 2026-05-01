// import React, { createContext, useState, useContext, useEffect } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// const API_URL = import.meta.env.VITE_API_URL || 'https://backend-production-a698.up.railway.app';

// console.log('API URL:', API_URL); // Debug log

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [token, setToken] = useState(localStorage.getItem('token'));

//   // Set token header globally
//   useEffect(() => {
//     if (token) {
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       fetchUser();
//     } else {
//       delete axios.defaults.headers.common['Authorization'];
//       setLoading(false);
//     }
//   }, [token]);

//   const fetchUser = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/api/auth/me`);
//       setUser(response.data);
//     } catch (error) {
//       console.error('Fetch user error:', error);
//       localStorage.removeItem('token');
//       setToken(null);
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
//       const { token, user } = response.data;

//       localStorage.setItem('token', token);
//       setToken(token);
//       setUser(user);

//       toast.success('Login successful!');
//       return true;
//     } catch (error) {
//       console.error('Login error details:', error.response?.data);
//       toast.error(error.response?.data?.message || error.response?.data?.error || 'Login failed');
//       return false;
//     }
//   };

//   // ================= FIXED SIGNUP =================
//   const signup = async (name, email, password) => {
//     try {
//       console.log('Attempting signup with:', { name, email, password: '***' });
//       console.log('API URL:', `${API_URL}/api/auth/register`);
      
//       const response = await axios.post(`${API_URL}/api/auth/register`, {
//         name,
//         email,
//         password
//       }, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         timeout: 10000 // 10 second timeout
//       });

//       console.log('Signup response:', response.data);

//       const { token, user } = response.data;

//       if (!token || !user) {
//         throw new Error('Invalid response from server');
//       }

//       localStorage.setItem('token', token);
//       setToken(token);
//       setUser(user);

//       toast.success('Account created successfully!');
//       return true;
//     } catch (error) {
//       console.error('Full signup error:', error);
      
//       // Detailed error handling
//       let errorMessage = 'Signup failed';
      
//       if (error.code === 'ECONNABORTED') {
//         errorMessage = 'Request timeout. Server might be slow.';
//       } else if (error.message === 'Network Error') {
//         errorMessage = 'Cannot connect to server. Please check your internet connection.';
//       } else if (error.response) {
//         // Server responded with error
//         console.error('Error response data:', error.response.data);
//         errorMessage = error.response.data?.message || 
//                       error.response.data?.error || 
//                       `Server error: ${error.response.status}`;
        
//         if (error.response.status === 400) {
//           errorMessage = 'Invalid input. Please check all fields.';
//         } else if (error.response.status === 409) {
//           errorMessage = 'Email already exists. Please use a different email.';
//         } else if (error.response.status === 500) {
//           errorMessage = 'Server error. Please try again later.';
//         }
//       } else if (error.request) {
//         errorMessage = 'No response from server. Please try again.';
//       }
      
//       toast.error(errorMessage);
//       return false;
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     setToken(null);
//     setUser(null);
//     delete axios.defaults.headers.common['Authorization'];
//     toast.success('Logged out successfully');
//   };

//   const value = {
//     user,
//     login,
//     signup,
//     logout,
//     loading,
//     isAdmin: user?.role === 'Admin'
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Fetch user error:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { 
        email, 
        password 
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // ✅ FIXED SIGNUP - Using /signup endpoint
  const signup = async (name, email, password) => {
    try {
      console.log('📝 Attempting signup to:', `${API_URL}/api/auth/signup`);
      
      const response = await axios.post(`${API_URL}/api/auth/signup`, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password
      });
      
      console.log('✅ Signup response:', response.data);
      
      if (response.data.token) {
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
        
        toast.success(response.data.message || 'Account created successfully!');
        return true;
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      
      let errorMessage = 'Signup failed';
      
      if (error.response) {
        // Handle validation errors
        if (error.response.data.errors) {
          errorMessage = error.response.data.errors.map(e => e.msg).join(', ');
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        // Handle specific status codes
        if (error.response.status === 400) {
          errorMessage = errorMessage || 'Invalid input. Please check all fields.';
        } else if (error.response.status === 401) {
          errorMessage = 'Invalid credentials';
        }
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please check if backend is running on port 5000';
      }
      
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    isAdmin: user?.role === 'Admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};