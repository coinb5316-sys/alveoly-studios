import { createImageEditorJob, checkImageEditorJob } from '../services/aiEngine.js';
import { uploadToCloudinary } from '../services/storage.js';
import Asset from '../models/Asset.js';
import User from '../models/User.js';

export const startImageEdit = async (req, res) => {
  try {
    const { imageUrl, prompt, model, aspectRatio, resolution } = req.body;

    if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' });
    if (!prompt || prompt.trim() === '') return res.status(400).json({ error: 'Edit prompt is required' });

    const projectId = await createImageEditorJob(imageUrl, prompt.trim(), {
      model,
      aspectRatio,
      resolution,
    });

    res.json({ projectId, status: 'pending', prompt: prompt.trim() });
  } catch (err) {
    console.error('Image Editor start error:', err);
    res.status(500).json({ error: err.message || 'Failed to start image edit' });
  }
};

export const checkImageEdit = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { prompt, sourceUrl } = req.query;

    const status = await checkImageEditorJob(projectId);

    if (status.status === 'complete') {
      const permanentUrl = await uploadToCloudinary(status.downloadUrl, 'image');

      await Asset.create({
        userId: req.user.id,
        type: 'image',
        kind: 'image-edit',
        prompt: prompt || 'Image edit',
        cloudinaryUrl: permanentUrl,
        sourceUrl: sourceUrl || undefined,
      });

      if (req.toolCost && req.toolCost > 0) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -req.toolCost } });
      }

      return res.json({ status: 'completed', url: permanentUrl });
    }

    if (status.status === 'error' || status.status === 'canceled') {
      return res.status(400).json({ status: 'failed', error: status.error || 'Image edit failed' });
    }

    res.json({ status: 'pending' });
  } catch (err) {
    console.error('Image Editor status error:', err);
    res.status(500).json({ error: err.message || 'Status check failed' });
  }
};