// routes/chatRoutes.js
import express from 'express';
import {
  startGuestSession,
  listConversations,
  getConversation,
  adminReply,
  markRead,
  closeConversation,
} from '../controllers/chatController.js';

// `protect` lives in middleware/auth.js
// `adminProtect` lives in middleware/adminAuth.js
import { protect } from '../middleware/auth.js';
import { adminProtect } from '../middleware/adminAuth.js';

const router = express.Router();

// ── Public — guests can start a session without auth ──
router.post('/session', startGuestSession);

// ── Admin — every other chat route requires admin auth ──
router.get('/conversations', protect, adminProtect, listConversations);
router.get('/conversations/:id', protect, adminProtect, getConversation);
router.post('/conversations/:id/reply', protect, adminProtect, adminReply);
router.post('/conversations/:id/read', protect, adminProtect, markRead);
router.post('/conversations/:id/close', protect, adminProtect, closeConversation);

export default router;