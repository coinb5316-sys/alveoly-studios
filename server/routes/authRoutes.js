import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// NOTE: Google routes are mounted directly in server.js at /auth/google
// to match the Google Cloud Console callback URL.

export default router;