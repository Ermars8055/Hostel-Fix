import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Generate JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const { name, email, password, role, hostelName, roomNumber } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role || !hostelName || !roomNumber) {
      return res.status(400).json({ 
        message: 'Please provide all required fields',
        missing: {
          name: !name,
          email: !email,
          password: !password,
          role: !role,
          hostelName: !hostelName,
          roomNumber: !roomNumber
        }
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Creating new user...');
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      hostelName,
      roomNumber
    });

    console.log('User created:', user);

    if (user) {
      console.log('Generating token...');
      const token = generateToken(user._id);
      
      console.log('Setting cookie...');
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      console.log('Sending response...');
      res.status(201).json({
        token,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hostelName: user.hostelName,
        roomNumber: user.roomNumber
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hostelName: user.hostelName,
      roomNumber: user.roomNumber
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 