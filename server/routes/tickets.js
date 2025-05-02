import express from 'express';
import { check, validationResult } from 'express-validator';
import path from 'path';
import Ticket from '../models/Ticket.js';
import { authenticate, isAdmin, isStudent } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/tickets
// @desc    Create a new ticket
// @access  Private (Student)
router.post(
  '/',
  authenticate,
  isStudent,
  async (req, res) => {
    try {
      // Handle file upload using multer
      req.upload.single('image')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
        
        // File validation
        const { title, description, category, hostelName, roomNumber } = req.body;
        
        // Validation
        if (!title || !description || !category || !hostelName || !roomNumber) {
          return res.status(400).json({ message: 'All fields are required' });
        }
        
        try {
          // Create ticket
          const newTicket = new Ticket({
            title,
            description,
            category,
            hostelName,
            roomNumber,
            student: req.user._id,
            studentName: req.user.name,
            imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined
          });
          
          await newTicket.save();
          res.status(201).json(newTicket);
        } catch (error) {
          console.error('Create ticket error:', error.message);
          res.status(500).json({ message: 'Server error' });
        }
      });
    } catch (error) {
      console.error('Upload middleware error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/tickets
// @desc    Get all tickets (admin)
// @access  Private (Admin)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .sort({ createdAt: -1 });
    
    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tickets/my-tickets
// @desc    Get user's tickets
// @access  Private (Student)
router.get('/my-tickets', authenticate, isStudent, async (req, res) => {
  try {
    const tickets = await Ticket.find({ student: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(tickets);
  } catch (error) {
    console.error('Get my tickets error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tickets/recent
// @desc    Get recent tickets (admin)
// @access  Private (Admin)
router.get('/recent', authenticate, isAdmin, async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json(tickets);
  } catch (error) {
    console.error('Get recent tickets error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tickets/stats
// @desc    Get ticket statistics
// @access  Private (Admin)
router.get('/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const total = await Ticket.countDocuments();
    const pending = await Ticket.countDocuments({ status: 'pending' });
    const inProgress = await Ticket.countDocuments({ status: 'in-progress' });
    const viewed = await Ticket.countDocuments({ status: 'viewed' });
    const resolved = await Ticket.countDocuments({ status: 'resolved' });
    
    res.json({
      total,
      pending,
      inProgress,
      viewed,
      resolved
    });
  } catch (error) {
    console.error('Get ticket stats error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tickets/my-stats
// @desc    Get user's ticket statistics
// @access  Private (Student)
router.get('/my-stats', authenticate, isStudent, async (req, res) => {
  try {
    const total = await Ticket.countDocuments({ student: req.user._id });
    const pending = await Ticket.countDocuments({ 
      student: req.user._id,
      status: 'pending'
    });
    const inProgress = await Ticket.countDocuments({ 
      student: req.user._id,
      status: 'in-progress'
    });
    const viewed = await Ticket.countDocuments({ 
      student: req.user._id,
      status: 'viewed'
    });
    const resolved = await Ticket.countDocuments({ 
      student: req.user._id,
      status: 'resolved'
    });
    
    res.json({
      total,
      pending,
      inProgress,
      viewed,
      resolved
    });
  } catch (error) {
    console.error('Get my ticket stats error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tickets/:id
// @desc    Get ticket by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Check if user is admin or ticket owner
    if (req.user.role !== 'admin' && 
        ticket.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(ticket);
  } catch (error) {
    console.error('Get ticket by ID error:', error.message);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/tickets/:id/status
// @desc    Update ticket status
// @access  Private (Admin)
router.patch(
  '/:id/status',
  authenticate,
  isAdmin,
  [
    check('status', 'Status is required').isIn(['pending', 'in-progress', 'viewed', 'resolved'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    
    try {
      const ticket = await Ticket.findById(req.params.id);
      
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      
      ticket.status = req.body.status;
      await ticket.save();
      
      res.json(ticket);
    } catch (error) {
      console.error('Update ticket status error:', error.message);
      
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;