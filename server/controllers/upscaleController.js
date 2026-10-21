import { createUpscaleJob, checkUpscaleJob } from '../services/aiEngine.js';
import { uploadToCloudinary } from '../services/storage.js';
import Asset from '../models/Asset.js';
import User from '../models/User.js';

export const startUpscale = async (req, res) => {
  try {
    const { imageUrl, scaleFactor, mode, prompt } = req.body;

    if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' });

    const projectId = await createUpscaleJob(imageUrl, {
      scaleFactor: scaleFactor ?? 2,
      mode: mode ?? 'balanced',
      prompt,
    });

    res.json({ projectId, status: 'pending', prompt: 'Upscaled image' });
  } catch (err) {
    console.error('Upscale start error:', err);
    res.status(500).json({ error: err.message || 'Failed to start' });
  }
};

export const checkUpscale = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { prompt, sourceUrl } = req.query;

    const status = await checkUpscaleJob(projectId);

    if (status.status === 'complete') {
      const permanentUrl = await uploadToCloudinary(status.downloadUrl, 'image');

      await Asset.create({
        userId: req.user.id,
        type: 'image',
        kind: 'upscale',
        prompt: prompt || 'Upscaled image',
        cloudinaryUrl: permanentUrl, creditsCost: 1,
        sourceUrl: sourceUrl || undefined,
      });

      if (req.toolCost && req.toolCost > 0) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -req.toolCost } });
      }

      return res.json({ status: 'completed', url: permanentUrl });
    }

    if (status.status === 'error' || status.status === 'canceled') {
      return res.status(400).json({ status: 'failed', error: status.error || 'Upscale failed' });
    }

    res.json({ status: 'pending' });
  } catch (err) {
    console.error('Upscale status error:', err);
    res.status(500).json({ error: err.message || 'Status check failed' });
  }
};