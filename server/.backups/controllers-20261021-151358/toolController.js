import fs from 'fs';
import {
  createSubtitleJob, checkSubtitleJob,
  createTranslatorJob, checkTranslatorJob,
  createGifJob, checkGifJob,
  createAnimationJob, checkAnimationJob,
} from '../services/aiEngine.js';
import { uploadToCloudinary } from '../services/storage.js';
import cloudinary from '../config/cloudinary.js';
import Asset from '../models/Asset.js';
import User from '../models/User.js';

async function uploadFromPathOrUrl(source, resourceType = 'video') {
  if (!source) throw new Error('No source provided for upload');
  if (source.startsWith('http://') || source.startsWith('https://')) {
    return uploadToCloudinary(source, resourceType);
  }
  const buffer = fs.readFileSync(source);
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ resource_type: resourceType, folder: 'alveoly_studios' }, (error, res) => (error ? reject(error) : resolve(res))).end(buffer);
  });
  return result.secure_url;
}

/* ── Auto Subtitle ── */
export const startSubtitle = async (req, res) => {
  try {
    const { videoUrl, endSeconds } = req.body;
    if (!videoUrl) return res.status(400).json({ error: 'videoUrl required' });
    const projectId = await createSubtitleJob(videoUrl, { endSeconds });
    res.json({ projectId, status: 'pending', prompt: 'Subtitles' });
  } catch (err) {
    console.error('Subtitle start error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const checkSubtitle = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { sourceUrl } = req.query;
    const status = await checkSubtitleJob(projectId);
    if (status.status === 'complete') {
      const permanentUrl = await uploadFromPathOrUrl(status.downloadUrl, 'video');
      await Asset.create({ userId: req.user.id, type: 'video', kind: 'subtitle', prompt: 'Subtitled video', cloudinaryUrl: permanentUrl, sourceUrl });
      if (req.toolCost && req.toolCost > 0) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -req.toolCost } });
      }
      return res.json({ status: 'completed', url: permanentUrl });
    }
    if (status.status === 'error' || status.status === 'canceled') {
      return res.status(400).json({ status: 'failed', error: status.error });
    }
    res.json({ status: 'pending' });
  } catch (err) {
    console.error('Subtitle check error:', err);
    res.status(500).json({ error: err.message });
  }
};

/* ── Video Translator ── */
export const startTranslator = async (req, res) => {
  try {
    const { videoUrl, targetLanguage, endSeconds } = req.body;
    if (!videoUrl || !targetLanguage) return res.status(400).json({ error: 'videoUrl and targetLanguage required' });
    const projectId = await createTranslatorJob(videoUrl, targetLanguage, { endSeconds });
    res.json({ projectId, status: 'pending', prompt: `Translate to ${targetLanguage}` });
  } catch (err) {
    console.error('Translator start error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const checkTranslator = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { sourceUrl } = req.query;
    const status = await checkTranslatorJob(projectId);
    if (status.status === 'complete') {
      const permanentUrl = await uploadFromPathOrUrl(status.downloadUrl, 'video');
      await Asset.create({ userId: req.user.id, type: 'video', kind: 'translate', prompt: 'Translated video', cloudinaryUrl: permanentUrl, sourceUrl });
      if (req.toolCost && req.toolCost > 0) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -req.toolCost } });
      }
      return res.json({ status: 'completed', url: permanentUrl });
    }
    if (status.status === 'error' || status.status === 'canceled') {
      return res.status(400).json({ status: 'failed', error: status.error });
    }
    res.json({ status: 'pending' });
  } catch (err) {
    console.error('Translator check error:', err);
    res.status(500).json({ error: err.message });
  }
};

/* ── GIF Generator ── */
export const startGif = async (req, res) => {
  try {
    const { prompt, outputFormat } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });
    const projectId = await createGifJob(prompt, { outputFormat });
    res.json({ projectId, status: 'pending', prompt });
  } catch (err) {
    console.error('GIF start error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const checkGif = async (req, res) => {
  try {
    const { projectId } = req.params;
    const status = await checkGifJob(projectId);
    if (status.status === 'complete') {
      const permanentUrl = await uploadFromPathOrUrl(status.downloadUrl, 'image');
      await Asset.create({ userId: req.user.id, type: 'image', kind: 'gif', prompt: 'AI GIF', cloudinaryUrl: permanentUrl });
      if (req.toolCost && req.toolCost > 0) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -req.toolCost } });
      }
      return res.json({ status: 'completed', url: permanentUrl });
    }
    if (status.status === 'error' || status.status === 'canceled') {
      return res.status(400).json({ status: 'failed', error: status.error });
    }
    res.json({ status: 'pending' });
  } catch (err) {
    console.error('GIF check error:', err);
    res.status(500).json({ error: err.message });
  }
};

/* ── Animation ── */
export const startAnimation = async (req, res) => {
  try {
    const { imageUrl, prompt, endSeconds, aspectRatio } = req.body;
    if (!imageUrl || !prompt) return res.status(400).json({ error: 'imageUrl and prompt required' });
    const projectId = await createAnimationJob(imageUrl, prompt, { endSeconds, aspectRatio });
    res.json({ projectId, status: 'pending', prompt });
  } catch (err) {
    console.error('Animation start error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const checkAnimation = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { sourceUrl } = req.query;
    const status = await checkAnimationJob(projectId);
    if (status.status === 'complete') {
      const permanentUrl = await uploadFromPathOrUrl(status.downloadUrl, 'video');
      await Asset.create({ userId: req.user.id, type: 'video', kind: 'animation', prompt: 'Animated video', cloudinaryUrl: permanentUrl, sourceUrl });
      if (req.toolCost && req.toolCost > 0) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -req.toolCost } });
      }
      return res.json({ status: 'completed', url: permanentUrl });
    }
    if (status.status === 'error' || status.status === 'canceled') {
      return res.status(400).json({ status: 'failed', error: status.error });
    }
    res.json({ status: 'pending' });
  } catch (err) {
    console.error('Animation check error:', err);
    res.status(500).json({ error: err.message });
  }
};