import express from 'express';
import { protect } from '../middleware/auth.js';
import { initializePayment, verifyPayment, getPaymentHistory } from '../controllers/paymentController.js';

const router = express.Router();
router.post('/initialize', protect, initializePayment);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);

export default router;