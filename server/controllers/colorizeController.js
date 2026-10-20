import { createColorizeJob, checkColorizeJob } from '../services/aiEngine.js';
import { uploadToCloudinary } from '../services/storage.js';
import Asset from '../models/Asset.js';
import User from '../models/User.js';

export const startColorize = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' });

    const projectId = await createColorizeJob(imageUrl);
    res.json({ projectId, status: 'pending', prompt: 'Colorized photo' });
  } catch (err) {
    console.error('Colorize start error:', err);
    res.status(500).json({ error: err.message || 'Failed to start' });
  }
};

export const checkColorize = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { sourceUrl } = req.query;

    const status = await checkColorizeJob(projectId);

    if (status.status === 'complete') {
      const permanentUrl = await uploadToCloudinary(status.downloadUrl, 'image');

      await Asset.create({
        userId: req.user.id,
        type: 'image',
        kind: 'colorize',
        prompt: 'Colorized photo',
        cloudinaryUrl: permanentUrl,
        sourceUrl: sourceUrl || undefined,
      });

      if (req.toolCost && req.toolCost > 0) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -req.toolCost } });
      }

      return res.json({ status: 'completed', url: permanentUrl });
    }

    if (status.status === 'error' || status.status === 'canceled') {
      return res.status(400).json({ status: 'failed', error: status.error || 'Colorization failed' });
    }

    res.json({ status: 'pending' });
  } catch (err) {
    console.error('Colorize status error:', err);
    res.status(500).json({ error: err.message || 'Status check failed' });
  }
};