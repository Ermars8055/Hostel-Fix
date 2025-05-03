import express from 'express';
import {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  addComment,
  updateStatus,
  getMyTickets,
  getMyStats
} from '../controllers/tickets.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Create ticket
router.post('/', createTicket);

// Get all tickets
router.get('/', getTickets);

// Get user's tickets
router.get('/my-tickets', getMyTickets);

// Get user's stats
router.get('/my-stats', getMyStats);

// Get single ticket
router.get('/:id', getTicket);

// Update ticket
router.put('/:id', updateTicket);

// Delete ticket
router.delete('/:id', deleteTicket);

// Add comment
router.post('/:id/comments', addComment);

// Update status
router.put('/:id/status', updateStatus);

export default router; 