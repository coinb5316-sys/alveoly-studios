import { createAudioJob, checkAudioJob, createTalkingPhotoJob, checkTalkingPhotoJob } from '../services/aiEngine.js';
import { uploadToCloudinary } from '../services/storage.js';
import Asset from '../models/Asset.js';
import User from '../models/User.js';

export const startTalkingPhoto = async (req, res) => {
  try {
    const { imageUrl, audioUrl, script, voice, endSeconds, generationMode } = req.body;

    if (!imageUrl) return res.status(400).json({ error: 'Image URL is required' });
    if (!audioUrl && (!script || script.trim() === '')) {
      return res.status(400).json({ error: 'Provide an audio file or a script' });
    }

    if (audioUrl) {
      const projectId = await createTalkingPhotoJob(imageUrl, audioUrl, { endSeconds, generationMode });
      return res.json({ projectId, status: 'pending', prompt: 'Talking photo', audioMode: 'uploaded' });
    }

    const ttsProjectId = await createAudioJob(script.trim(), { voice });
    return res.json({
      projectId: ttsProjectId,
      status: 'pending',
      prompt: script.trim().slice(0, 200),
      audioMode: 'tts',
      pendingPayload: { imageUrl, endSeconds, generationMode },
    });
  } catch (err) {
    console.error('Talking Photo start error:', err);
    res.status(500).json({ error: err.message || 'Failed to start' });
  }
};

export const checkTalkingPhoto = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { prompt, sourceUrl, duration } = req.query;

    const status = await checkTalkingPhotoJob(projectId);

    if (status.status === 'complete') {
      const permanentUrl = await uploadToCloudinary(status.downloadUrl, 'video');

      await Asset.create({
        userId: req.user.id,
        type: 'video',
        kind: 'talking-photo',
        prompt: prompt || 'Talking photo',
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
      return res.status(400).json({ status: 'failed', error: status.error || 'Talking photo generation failed' });
    }

    res.json({ status: 'pending' });
  } catch (err) {
    console.error('Talking Photo status error:', err);
    res.status(500).json({ error: err.message || 'Status check failed' });
  }
};

export const continueTalkingPhoto = async (req, res) => {
  try {
    const { imageUrl, audioUrl, endSeconds, generationMode } = req.body;

    if (!imageUrl || !audioUrl) return res.status(400).json({ error: 'imageUrl and audioUrl required' });

    const projectId = await createTalkingPhotoJob(imageUrl, audioUrl, { endSeconds, generationMode });
    res.json({ projectId, status: 'pending', prompt: 'Talking photo' });
  } catch (err) {
    console.error('Talking Photo continue error:', err);
    res.status(500).json({ error: err.message || 'Failed to continue' });
  }
};