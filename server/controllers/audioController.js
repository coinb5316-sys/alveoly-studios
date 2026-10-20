import { createAudioJob, checkAudioJob } from '../services/aiEngine.js';
import { uploadToCloudinary } from '../services/storage.js';
import Asset from '../models/Asset.js';
import User from '../models/User.js';

export const startAudio = async (req, res) => {
  try {
    const { mode = 'voiceover', prompt, voice } = req.body;

    if (mode !== 'voiceover') {
      return res.status(400).json({ error: 'Only voiceover is supported right now.' });
    }
    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const projectId = await createAudioJob(prompt.trim(), { voice });
    res.json({ projectId, status: 'pending', prompt });
  } catch (err) {
    console.error('Audio job creation error:', err);
    res.status(500).json({ error: err.message || 'Audio job creation failed' });
  }
};

export const checkAudio = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { prompt, voice } = req.query;

    const status = await checkAudioJob(projectId);

    if (status.status === 'complete') {
      const permanentUrl = await uploadToCloudinary(status.downloadUrl, 'video');

      await Asset.create({
        userId: req.user.id,
        type: 'audio',
        kind: 'audio',
        prompt: prompt || '',
        cloudinaryUrl: permanentUrl,
        voice: voice || undefined,
      });

      if (req.toolCost && req.toolCost > 0) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -req.toolCost } });
      }

      return res.json({ status: 'completed', url: permanentUrl });
    }

    if (status.status === 'error' || status.status === 'canceled') {
      return res.status(400).json({ status: 'failed', error: status.error || 'Audio generation failed' });
    }

    res.json({ status: 'pending' });
  } catch (err) {
    console.error('Audio status check error:', err);
    res.status(500).json({ error: err.message || 'Status check failed' });
  }
};