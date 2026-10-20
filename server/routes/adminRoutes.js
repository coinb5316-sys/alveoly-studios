import express from 'express';
import { protect } from '../middleware/auth.js';
import { adminProtect } from '../middleware/adminAuth.js';
import {
  getStats, getUsers, updateUserRole, toggleUserStatus, deleteUser, updateUserCredits,
  getAllPayments, getSettings, updateSetting, sendNotification
} from '../controllers/adminController.js';

const router = express.Router();
router.use(protect, adminProtect);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.post('/users/role', updateUserRole);
router.post('/users/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.post('/users/credits', updateUserCredits);

router.get('/payments', getAllPayments);
router.get('/settings', getSettings);
router.post('/settings', updateSetting);

router.post('/notifications', sendNotification);

export default router;