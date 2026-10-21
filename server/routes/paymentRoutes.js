// server/routes/paymentRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  initializePayment,
  verifyPayment,
  getPaymentHistory,
  getRate,
} from '../controllers/paymentController.js';

const router = express.Router();

// Public — used by the frontend hook so USD→GHS displays match Paystack
router.get('/rate', getRate);

// Authenticated
router.post('/initialize', protect, initializePayment);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);

export default router;