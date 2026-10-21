import { createImageJob, checkImageJob } from '../services/aiEngine.js';
import { uploadToCloudinary } from '../services/storage.js';
import Asset from '../models/Asset.js';
import User from '../models/User.js';

export const generateImageHandler = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const projectId = await createImageJob(prompt);
    res.json({ projectId, status: 'pending', prompt });
  } catch (err) {
    console.error('Image job creation error:', err);
    res.status(500).json({ error: err.message || 'Image job creation failed' });
  }
};

export const checkImage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { prompt, model, style, aspectRatio, seed, guidance, negativePrompt } = req.query;

    const status = await checkImageJob(projectId);

    if (status.status === 'complete') {
      const permanentUrl = await uploadToCloudinary(status.downloadUrl, 'image');

      await Asset.create({
        userId: req.user.id,
        type: 'image',
        kind: 'image',
        prompt: prompt || '',
        cloudinaryUrl: permanentUrl, creditsCost: 1,
        model: model || undefined,
        style: style || undefined,
        aspectRatio: aspectRatio || undefined,
        seed: seed !== undefined ? Number(seed) : undefined,
        guidance: guidance !== undefined ? Number(guidance) : undefined,
        negativePrompt: negativePrompt || undefined,
      });

      if (req.toolCost && req.toolCost > 0) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -req.toolCost } });
      }

      return res.json({ status: 'completed', url: permanentUrl });
    }

    if (status.status === 'error' || status.status === 'canceled') {
      return res.status(400).json({ status: 'failed', error: status.error || 'Image generation failed' });
    }

    res.json({ status: 'pending' });
  } catch (err) {
    console.error('Image status check error:', err);
    res.status(500).json({ error: err.message || 'Status check failed' });
  }
};