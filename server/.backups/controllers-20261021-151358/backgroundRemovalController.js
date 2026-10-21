import { createBackgroundRemovalJob, checkBackgroundRemovalJob } from '../services/aiEngine.js';
import { uploadToCloudinary } from '../services/storage.js';
import Asset from '../models/Asset.js';
import User from '../models/User.js';

export const startBackgroundRemoval = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) return res.status(400).json({ error: 'Image URL is required' });

    const projectId = await createBackgroundRemovalJob(imageUrl);
    res.json({ projectId, status: 'pending', prompt: 'Background removal' });
  } catch (err) {
    console.error('Background removal start error:', err);
    res.status(500).json({ error: err.message || 'Failed to start' });
  }
};

export const checkBackgroundRemoval = async (req, res) => {
  try {
    const { projectId } = req.params;

    const status = await checkBackgroundRemovalJob(projectId);

    if (status.status === 'complete') {
      const permanentUrl = await uploadToCloudinary(status.downloadUrl, 'image');

      await Asset.create({
        userId: req.user.id,
        type: 'image',
        kind: 'background-removal',
        prompt: 'Background removed',
        cloudinaryUrl: permanentUrl,
      });

      if (req.toolCost && req.toolCost > 0) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -req.toolCost } });
      }

      return res.json({ status: 'completed', url: permanentUrl });
    }

    if (status.status === 'error' || status.status === 'canceled') {
      return res.status(400).json({ status: 'failed', error: status.error || 'Background removal failed' });
    }

    res.json({ status: 'pending' });
  } catch (err) {
    console.error('Background removal status error:', err);
    res.status(500).json({ error: err.message || 'Status check failed' });
  }
};