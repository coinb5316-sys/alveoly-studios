import { createVideoToVideoJob, checkVideoJob } from '../services/aiEngine.js';
import { uploadToCloudinary } from '../services/storage.js';
import Asset from '../models/Asset.js';
import User from '../models/User.js';

export const startVideoToVideo = async (req, res) => {
  try {
    const { videoUrl, artStyle, prompt, endSeconds } = req.body;

    if (!videoUrl) return res.status(400).json({ error: 'videoUrl is required' });
    if (!artStyle && (!prompt || prompt.trim() === '')) {
      return res.status(400).json({ error: 'Provide an art style or a custom prompt' });
    }

    const projectId = await createVideoToVideoJob(
      videoUrl,
      artStyle,
      prompt || `Apply ${artStyle} style`,
      { endSeconds }
    );

    res.json({ projectId, status: 'pending', prompt: prompt || artStyle });
  } catch (err) {
    console.error('Video→Video job creation error:', err);
    res.status(500).json({ error: err.message || 'Failed to start' });
  }
};

export const checkVideoToVideo = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { prompt, style, sourceUrl, duration } = req.query;

    const status = await checkVideoJob(projectId);

    if (status.status === 'complete') {
      const permanentUrl = await uploadToCloudinary(status.downloadUrl, 'video');

      await Asset.create({
        userId: req.user.id,
        type: 'video',
        kind: 'video-to-video',
        prompt: prompt || '',
        cloudinaryUrl: permanentUrl,
        style: style || undefined,
        duration: duration !== undefined ? Number(duration) : undefined,
        sourceUrl: sourceUrl || undefined,
      });

      if (req.toolCost && req.toolCost > 0) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -req.toolCost } });
      }

      return res.json({ status: 'completed', url: permanentUrl });
    }

    if (status.status === 'error' || status.status === 'canceled') {
      return res.status(400).json({ status: 'failed', error: status.error || 'Video→Video generation failed' });
    }

    res.json({ status: 'pending' });
  } catch (err) {
    console.error('Video→Video status check error:', err);
    res.status(500).json({ error: err.message || 'Status check failed' });
  }
};