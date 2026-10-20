import { createLipSyncJob, checkLipSyncJob } from '../services/aiEngine.js';
import { uploadToCloudinary } from '../services/storage.js';
import Asset from '../models/Asset.js';
import User from '../models/User.js';

export const startLipSync = async (req, res) => {
  try {
    const { videoUrl, audioUrl, endSeconds, maxFpsLimit } = req.body;

    if (!videoUrl) return res.status(400).json({ error: 'videoUrl is required' });
    if (!audioUrl) return res.status(400).json({ error: 'audioUrl is required' });

    const projectId = await createLipSyncJob(videoUrl, audioUrl, { endSeconds, maxFpsLimit });
    res.json({ projectId, status: 'pending', prompt: 'Lip sync' });
  } catch (err) {
    console.error('Lip Sync start error:', err);
    res.status(500).json({ error: err.message || 'Failed to start' });
  }
};

export const checkLipSync = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { prompt, sourceUrl, duration } = req.query;

    const status = await checkLipSyncJob(projectId);

    if (status.status === 'complete') {
      const permanentUrl = await uploadToCloudinary(status.downloadUrl, 'video');

      await Asset.create({
        userId: req.user.id,
        type: 'video',
        kind: 'lip-sync',
        prompt: prompt || 'Lip sync',
        cloudinaryUrl: permanentUrl,
        sourceUrl: sourceUrl || undefined,
        duration: duration !== undefined ? Number(duration) : undefined,
      });

      if (req.toolCost && req.toolCost > 0) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -req.toolCost } });
      }

      return res.json({ status: 'completed', url: permanentUrl });
    }

    if (status.status === 'error' || status.status === 'canceled') {
      return res.status(400).json({ status: 'failed', error: status.error || 'Lip sync failed' });
    }

    res.json({ status: 'pending' });
  } catch (err) {
    console.error('Lip Sync status error:', err);
    res.status(500).json({ error: err.message || 'Status check failed' });
  }
};