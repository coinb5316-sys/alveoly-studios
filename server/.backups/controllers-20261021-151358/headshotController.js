import { createHeadshotJob, checkHeadshotJob } from '../services/aiEngine.js';
import { uploadToCloudinary } from '../services/storage.js';
import Asset from '../models/Asset.js';
import User from '../models/User.js';

export const startHeadshot = async (req, res) => {
  try {
    const { imageUrl, prompt } = req.body;

    if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' });

    const projectId = await createHeadshotJob(imageUrl, { prompt });
    res.json({ projectId, status: 'pending', prompt: prompt || 'Professional headshot' });
  } catch (err) {
    console.error('Headshot start error:', err);
    res.status(500).json({ error: err.message || 'Failed to start' });
  }
};

export const checkHeadshot = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { prompt, sourceUrl } = req.query;

    const status = await checkHeadshotJob(projectId);

    if (status.status === 'complete') {
      const permanentUrl = await uploadToCloudinary(status.downloadUrl, 'image');

      await Asset.create({
        userId: req.user.id,
        type: 'image',
        kind: 'headshot',
        prompt: prompt || 'Professional headshot',
        cloudinaryUrl: permanentUrl,
        sourceUrl: sourceUrl || undefined,
      });

      if (req.toolCost && req.toolCost > 0) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -req.toolCost } });
      }

      return res.json({ status: 'completed', url: permanentUrl });
    }

    if (status.status === 'error' || status.status === 'canceled') {
      return res.status(400).json({ status: 'failed', error: status.error || 'Headshot generation failed' });
    }

    res.json({ status: 'pending' });
  } catch (err) {
    console.error('Headshot status error:', err);
    res.status(500).json({ error: err.message || 'Status check failed' });
  }
};