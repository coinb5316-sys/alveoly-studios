import Asset from '../models/Asset.js';
import User from '../models/User.js';
import {
  createImageJob,
  createVideoJob,
  createImageToVideoJob,
  createVideoToVideoJob,
  createAudioJob,
  createVoiceCloneJob,
} from '../services/aiEngine.js';

const EDITABLE_KINDS = [
  'image',
  'video',
  'image-to-video',
  'video-to-video',
  'audio',
  'voice-clone',
];

/**
 * POST /api/assets/:id/rerun
 * Body: { prompt?, style?, aspectRatio?, resolution?, duration?, model?, negativePrompt?, seed?, voice? }
 * Re-fires the same generation kind with new parameters. Returns the new projectId.
 */
export const rerunAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findOne({ _id: id, userId: req.user.id }).lean();
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    const kind = asset.kind || inferKind(asset);
    if (!EDITABLE_KINDS.includes(kind)) {
      return res.status(400).json({ error: `This asset type can't be re-run (${kind})` });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.credits < 1) return res.status(400).json({ error: 'Insufficient credits' });

    const body = req.body || {};
    const merged = {
      prompt: (body.prompt ?? asset.prompt ?? '').trim(),
      model: body.model ?? asset.model ?? '',
      style: body.style ?? asset.style ?? '',
      aspectRatio: body.aspectRatio ?? asset.aspectRatio ?? '',
      resolution: body.resolution ?? asset.resolution ?? '',
      duration: body.duration ?? asset.duration,
      seed: body.seed ?? asset.seed,
      guidance: body.guidance ?? asset.guidance,
      negativePrompt: body.negativePrompt ?? asset.negativePrompt ?? '',
      voice: body.voice ?? asset.voice ?? '',
      sourceUrl: asset.sourceUrl || '',
    };

    if (!merged.prompt && kind !== 'video-to-video') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let projectId;

    switch (kind) {
      case 'image':
        projectId = await createImageJob(merged.prompt);
        break;
      case 'video':
        projectId = await createVideoJob(merged.prompt);
        break;
      case 'image-to-video':
        if (!merged.sourceUrl) {
          return res.status(400).json({ error: 'Original source image is missing' });
        }
        projectId = await createImageToVideoJob(merged.sourceUrl, merged.prompt, {
          model: merged.model,
          endSeconds: merged.duration,
          resolution: merged.resolution,
        });
        break;
      case 'video-to-video':
        if (!merged.sourceUrl) {
          return res.status(400).json({ error: 'Original source video is missing' });
        }
        projectId = await createVideoToVideoJob(
          merged.sourceUrl,
          merged.style || '3D Render',
          merged.prompt || `Apply ${merged.style || '3D Render'} style`,
          { endSeconds: merged.duration }
        );
        break;
      case 'audio':
        projectId = await createAudioJob(merged.prompt, { voice: merged.voice });
        break;
      case 'voice-clone':
        if (!merged.sourceUrl) {
          return res.status(400).json({ error: 'Original voice sample is missing' });
        }
        projectId = await createVoiceCloneJob(merged.sourceUrl, merged.prompt);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported kind' });
    }

    res.json({
      projectId,
      status: 'pending',
      kind,
      prompt: merged.prompt,
      params: merged,
    });
  } catch (err) {
    console.error('Rerun asset error:', err);
    res.status(500).json({ error: err.message || 'Failed to re-run generation' });
  }
};

function inferKind(asset) {
  if (asset.kind) return asset.kind;
  // Best-effort guess for legacy assets
  if (asset.type === 'image') return 'image';
  if (asset.type === 'video') return asset.sourceUrl ? 'image-to-video' : 'video';
  if (asset.type === 'audio') return 'audio';
  return 'image';
}