import Image from '../models/Image.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const image = new Image({
            filename: req.file.filename,
            path: req.file.path,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size
        });

        await image.save();

        res.status(201).json({
            message: 'Image uploaded successfully',
            image: {
                id: image._id,
                filename: image.filename,
                path: image.path,
                originalName: image.originalName,
                mimeType: image.mimeType,
                size: image.size,
                uploadedAt: image.uploadedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
};

export const getImage = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.sendFile(path.join(__dirname, '..', image.path));
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving image', error: error.message });
    }
};

export const deleteImage = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Delete file from filesystem
        fs.unlinkSync(path.join(__dirname, '..', image.path));

        // Delete from database
        await Image.findByIdAndDelete(req.params.id);

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image', error: error.message });
    }
}; 