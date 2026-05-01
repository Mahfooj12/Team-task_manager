// const express = require('express');
// // ✅ FIXED: Change from 'User' to 'Users'
// const User = require('../models/Users');
// const { auth, isAdmin } = require('../middleware/auth');

// const router = express.Router();

// // Get all users (admin only)
// router.get('/', auth, isAdmin, async (req, res) => {
//   try {
//     const users = await User.find().select('-password');
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Get users for project assignment
// router.get('/available', auth, async (req, res) => {
//   try {
//     const users = await User.find({ _id: { $ne: req.user._id } }).select('name email role');
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;

const express = require('express');
const User = require('../models/Users');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Get users for project assignment (excluding current user)
router.get('/available', auth, async (req, res) => {
  try {
    const users = await User.find({ 
      _id: { $ne: req.user._id } 
    }).select('name email role');
    
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Error fetching available users:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;