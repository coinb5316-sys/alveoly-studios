// routes/adminRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import { adminProtect } from '../middleware/adminAuth.js';
import {
  getStats,
  getUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  updateUserCredits,
  getAllPayments,
  getSettings,
  updateSetting,
  savePlans,
  deletePlanPrice,
  sendNotification,
  getMagicHourBalance,
  getUserCreditUsage,
  getOverview,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, adminProtect);

// Users
router.get('/stats', getStats);
router.get('/users', getUsers);
router.post('/users/role', updateUserRole);
router.post('/users/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.post('/users/credits', updateUserCredits);

// Payments
router.get('/payments', getAllPayments);

// Settings (generic key/value)
router.get('/settings', getSettings);
router.post('/settings', updateSetting);

// Plans (pricing-specific)
router.post('/plans', savePlans);           // save the whole plans object
router.delete('/plans/:id', deletePlanPrice); // reset one plan to default

// Notifications
router.post('/notifications', sendNotification);

// Magic Hour Monitoring
router.get('/magic-hour/balance', getMagicHourBalance);

router.get('/usage', getUserCreditUsage);


// Add the route
router.get('/overview', getOverview); // ← NEW

export default router;