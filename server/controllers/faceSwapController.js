import { createFaceSwapPhotoJob, checkFaceSwapPhotoJob } from '../services/aiEngine.js';
import { uploadToCloudinary } from '../services/storage.js';
import Asset from '../models/Asset.js';
import User from '../models/User.js';

export const startFaceSwap = async (req, res) => {
  try {
    const { sourceUrl, targetUrl, agreedToTerms } = req.body;

    if (!agreedToTerms) {
      return res.status(400).json({ error: 'You must confirm you have permission to use these images.' });
    }
    if (!sourceUrl || !targetUrl) {
      return res.status(400).json({ error: 'Both source and target images are required.' });
    }

    const projectId = await createFaceSwapPhotoJob(sourceUrl, targetUrl);
    res.json({ projectId, status: 'pending', prompt: 'Face swap' });
  } catch (err) {
    console.error('Face Swap start error:', err);
    res.status(500).json({ error: err.message || 'Failed to start face swap' });
  }
};

export const checkFaceSwap = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { sourceUrl } = req.query;

    const status = await checkFaceSwapPhotoJob(projectId);

    if (status.status === 'complete') {
      const permanentUrl = await uploadToCloudinary(status.downloadUrl, 'image');

      await Asset.create({
        userId: req.user.id,
        type: 'image',
        kind: 'face-swap',
        prompt: 'Face swap',
        cloudinaryUrl: permanentUrl, creditsCost: 1,
        sourceUrl: sourceUrl || undefined,
      });

      if (req.toolCost && req.toolCost > 0) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -req.toolCost } });
      }

      return res.json({ status: 'completed', url: permanentUrl });
    }

    if (status.status === 'error' || status.status === 'canceled') {
      return res.status(400).json({ status: 'failed', error: status.error || 'Face swap failed' });
    }

    res.json({ status: 'pending' });
  } catch (err) {
    console.error('Face Swap status error:', err);
    res.status(500).json({ error: err.message || 'Status check failed' });
  }
};