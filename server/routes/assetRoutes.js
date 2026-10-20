import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  listAssets,
  getAssetStats,
  deleteAsset,
  streamAsset,
} from '../controllers/assetController.js';
import { rerunAsset } from '../controllers/assetEditController.js';

const router = express.Router();

// Specific routes first (before /:id)
router.get('/', protect, listAssets);
router.get('/stats', protect, getAssetStats);
router.get('/:id/stream', streamAsset);           // auth handled inside
router.post('/:id/rerun', protect, rerunAsset);   // ← NEW
router.delete('/:id', protect, deleteAsset);

export default router;