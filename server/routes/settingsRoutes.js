// routes/settingsRoutes.js
import express from 'express';
import { getPublicPlans } from '../controllers/settingsController.js';

const router = express.Router();

// Public — used by /pricing, /pricing/confirm, /dashboard/billing
router.get('/prices', getPublicPlans);

export default router;