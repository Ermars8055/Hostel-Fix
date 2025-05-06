import express from 'express';
import upload from '../middleware/upload.js';
import { uploadImage, getImage, deleteImage } from '../controllers/imageController.js';

const router = express.Router();

// Upload image
router.post('/upload', upload.single('image'), uploadImage);

// Get image by ID
router.get('/:id', getImage);

// Delete image
router.delete('/:id', deleteImage);

export default router; 