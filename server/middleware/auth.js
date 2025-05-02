import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to authenticate user
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user by id
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Middleware to check if user is a student (boys or girls)
export const isStudent = (req, res, next) => {
  if (req.user && (req.user.role === 'boys' || req.user.role === 'girls')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Student privileges required.' });
  }
};

// Middleware to check if user is accessing their own data
export const isOwner = (req, res, next) => {
  const userId = req.params.userId || req.body.userId;
  
  if (req.user && (req.user._id.toString() === userId || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. You can only access your own data.' });
  }
};