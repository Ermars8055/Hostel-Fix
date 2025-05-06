import express from 'express';
import {
  getTickets,
  getTicketStats,
  updateTicketStatus,
  assignTicket,
  getUsers,
  updateUser,
  deleteUser,
  getSystemStats,
  updateSystemSettings
} from '../controllers/admin.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(admin);

// Ticket management
router.get('/tickets', getTickets);
router.get('/tickets/stats', getTicketStats);
router.put('/tickets/:id/status', updateTicketStatus);
router.put('/tickets/:id/assign', assignTicket);

// User management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// System management
router.get('/stats', getSystemStats);
router.put('/settings', updateSystemSettings);

export default router; 