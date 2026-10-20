import { createVoiceCloneJob, checkAudioJob } from '../services/aiEngine.js';
import { uploadToCloudinary } from '../services/storage.js';
import Asset from '../models/Asset.js';
import User from '../models/User.js';

export const startVoiceClone = async (req, res) => {
  try {
    const { audioUrl, prompt } = req.body;

    if (!audioUrl) return res.status(400).json({ error: 'Audio sample URL is required' });
    if (!prompt || prompt.trim() === '') return res.status(400).json({ error: 'Text to speak is required' });

    const projectId = await createVoiceCloneJob(audioUrl, prompt.trim());
    res.json({ projectId, status: 'pending', prompt });
  } catch (err) {
    console.error('Voice clone job creation error:', err);
    res.status(500).json({ error: err.message || 'Voice clone failed to start' });
  }
};

export const checkVoiceClone = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { prompt, sourceUrl } = req.query;

    const status = await checkAudioJob(projectId);

    if (status.status === 'complete') {
      const permanentUrl = await uploadToCloudinary(status.downloadUrl, 'video');

      await Asset.create({
        userId: req.user.id,
        type: 'audio',
        kind: 'voice-clone',
        prompt: prompt || 'Voice clone',
        cloudinaryUrl: permanentUrl,
        sourceUrl: sourceUrl || undefined,
      });

      if (req.toolCost && req.toolCost > 0) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -req.toolCost } });
      }

      return res.json({ status: 'completed', url: permanentUrl });
    }

    if (status.status === 'error' || status.status === 'canceled') {
      return res.status(400).json({ status: 'failed', error: status.error || 'Voice cloning failed' });
    }

    res.json({ status: 'pending' });
  } catch (err) {
    console.error('Voice clone status check error:', err);
    res.status(500).json({ error: err.message || 'Status check failed' });
  }
};