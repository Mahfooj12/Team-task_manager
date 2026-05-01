const jwt = require('jsonwebtoken');
// ✅ FIXED: Change from 'User' to 'Users' (matching your file name)
const User = require('../models/Users');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Support both userId and id formats
    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Please authenticate', success: false });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.', success: false });
  }
  next();
};

module.exports = { auth, isAdmin };