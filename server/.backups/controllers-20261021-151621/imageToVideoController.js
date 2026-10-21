import { createImageToVideoJob, checkVideoJob } from '../services/aiEngine.js';
import { uploadToCloudinary } from '../services/storage.js';
import Asset from '../models/Asset.js';
import User from '../models/User.js';

export const startImageToVideo = async (req, res) => {
  try {
    const { imageUrl, prompt, model, endSeconds, resolution, aspectRatio } = req.body;

    if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' });
    if (!prompt || prompt.trim() === '') return res.status(400).json({ error: 'Prompt is required' });

    const projectId = await createImageToVideoJob(imageUrl, prompt, {
      model,
      endSeconds,
      resolution,
      aspectRatio,
    });

    res.json({ projectId, status: 'pending', prompt });
  } catch (err) {
    console.error('Image→Video job creation error:', err);
    res.status(500).json({ error: err.message || 'Failed to start' });
  }
};

export const checkImageToVideo = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { prompt, model, resolution, sourceUrl, duration, aspectRatio } = req.query;

    const status = await checkVideoJob(projectId);

    if (status.status === 'complete') {
      const permanentUrl = await uploadToCloudinary(status.downloadUrl, 'video');

      await Asset.create({
        userId: req.user.id,
        type: 'video',
        kind: 'image-to-video',
        prompt: prompt || '',
        cloudinaryUrl: permanentUrl,
        model: model || undefined,
        resolution: resolution || undefined,
        aspectRatio: aspectRatio || undefined,
        duration: duration !== undefined ? Number(duration) : undefined,
        sourceUrl: sourceUrl || undefined,
      });

      if (req.toolCost && req.toolCost > 0) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -req.toolCost } });
      }

      return res.json({ status: 'completed', url: permanentUrl });
    }

    if (status.status === 'error' || status.status === 'canceled') {
      return res.status(400).json({ status: 'failed', error: status.error || 'Image→Video generation failed' });
    }

    res.json({ status: 'pending' });
  } catch (err) {
    console.error('Image→Video status check error:', err);
    res.status(500).json({ error: err.message || 'Status check failed' });
  }
};