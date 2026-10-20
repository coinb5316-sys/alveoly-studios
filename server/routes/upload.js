// src/routes/upload.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload, uploadBufferToCloudinary } from '../services/upload.js';

const router = express.Router();

/**
 * POST /api/upload
 * Field: `file` (multipart/form-data)
 * Returns: { url, type }
 */
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const url = await uploadBufferToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      'alveoly_uploads'
    );

    const type = req.file.mimetype.split('/')[0]; // image | video | audio
    res.json({ url, type });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

export default router;