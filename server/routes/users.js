import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserRole,
  updateProfile
} from '../controllers/users.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes (only require authentication)
router.put('/profile', protect, updateProfile);

// Admin routes
router.use(protect, admin);

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.route('/:id/role')
  .put(updateUserRole);

export default router; 