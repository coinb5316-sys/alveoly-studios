// src/services/upload.js
import cloudinary from '../config/cloudinary.js';
import multer from 'multer';

// Multer in-memory storage — we pipe the buffer straight to Cloudinary
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime',
      'audio/mpeg', 'audio/wav', 'audio/mp4',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type'));
  },
});

/**
 * Upload an in-memory file buffer to Cloudinary.
 * Returns the secure URL.
 */
export async function uploadBufferToCloudinary(buffer, mimetype, folder = 'alveoly_uploads') {
  const resourceType = mimetype.startsWith('video')
    ? 'video'
    : mimetype.startsWith('audio')
      ? 'video' // Cloudinary treats audio as video resource
      : 'image';

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder },
      (err, res) => (err ? reject(err) : resolve(res))
    );
    stream.end(buffer);
  });

  return result.secure_url;
}