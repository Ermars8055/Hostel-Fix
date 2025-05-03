import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

export const boysHostel = (req, res, next) => {
  if (req.user && req.user.role === 'boys') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized for boys hostel' });
  }
};

export const girlsHostel = (req, res, next) => {
  if (req.user && req.user.role === 'girls') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized for girls hostel' });
  }
}; 