import { createVideoJob, checkVideoJob } from '../services/aiEngine.js';
import { uploadToCloudinary } from '../services/storage.js';
import Asset from '../models/Asset.js';
import User from '../models/User.js';

export const startVideo = async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body;

    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const projectId = await createVideoJob(prompt, aspectRatio);
    res.json({ projectId, status: 'pending', prompt });
  } catch (err) {
    console.error('Video job creation error:', err);
    res.status(500).json({ error: err.message || 'Video job creation failed' });
  }
};

export const checkVideo = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { prompt, model, resolution, duration, aspectRatio } = req.query;

    const status = await checkVideoJob(projectId);

    if (status.status === 'complete') {
      const permanentUrl = await uploadToCloudinary(status.downloadUrl, 'video');

      await Asset.create({
        userId: req.user.id,
        type: 'video',
        kind: 'video',
        prompt: prompt || '',
        cloudinaryUrl: permanentUrl, creditsCost: 5,
        model: model || undefined,
        resolution: resolution || undefined,
        aspectRatio: aspectRatio || undefined,
        duration: duration !== undefined ? Number(duration) : undefined,
      });

      if (req.toolCost && req.toolCost > 0) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -req.toolCost } });
      }

      return res.json({ status: 'completed', url: permanentUrl });
    }

    if (status.status === 'error' || status.status === 'canceled') {
      return res.status(400).json({ status: 'failed', error: status.error || 'Video generation failed' });
    }

    res.json({ status: 'pending' });
  } catch (err) {
    console.error('Video status check error:', err);
    res.status(500).json({ error: err.message || 'Status check failed' });
  }
};