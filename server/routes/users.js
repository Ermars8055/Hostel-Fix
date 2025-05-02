import express from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  authenticate,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('hostelName', 'Hostel name is required').not().isEmpty(),
    check('roomNumber', 'Room number is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    
    const { name, hostelName, roomNumber } = req.body;
    
    try {
      // Update user
      const user = await User.findById(req.user._id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      user.name = name;
      user.hostelName = hostelName;
      user.roomNumber = roomNumber;
      
      await user.save();
      
      res.json(user);
    } catch (error) {
      console.error('Update profile error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/users/update-password
// @desc    Update user password
// @access  Private
router.put(
  '/update-password',
  authenticate,
  [
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    try {
      // Check current password
      const user = await User.findById(req.user._id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const isMatch = await user.comparePassword(currentPassword);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      // Update password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      
      await user.save();
      
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Update password error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/admin
// @desc    Create admin user (development purposes)
// @access  Public
router.post(
  '/admin',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    
    const { name, email, password } = req.body;
    
    try {
      // Check if user exists
      let user = await User.findOne({ email });
      
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Create admin user
      user = new User({
        name,
        email,
        password,
        role: 'admin'
      });
      
      await user.save();
      
      res.status(201).json({ message: 'Admin user created successfully' });
    } catch (error) {
      console.error('Create admin error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;