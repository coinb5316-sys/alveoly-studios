import { useMemo, useState } from 'react';
import { useQueue } from '../../context/QueueContext';
import api from '../../api/axios';
import { Button, Field, TextArea, Select, Slider, Panel, Chip } from '../ui';

const RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const RESOLUTIONS = ['480p', '720p', '1080p', '4k'];
const IMAGE_MODELS = ['flux-schnell', 'flux-pro', 'sdxl'];
const VIDEO_MODELS = ['runway-gen3', 'veo-2', 'kling-1.5', 'ltx-2.5', 'kling-3.0'];
const IMAGE_STYLES = ['photorealistic', 'cinematic', 'anime', '3d-render', 'illustration', 'cyberpunk'];
const VIDEO_STYLES = ['Retro Anime', '3D Render', 'Oil Painting', 'Cyberpunk', 'Vintage Film', 'Watercolor'];
const VOICES = ['Morgan Freeman', 'Joe Rogan', 'Donald Trump', 'Elon Musk', 'Barack Obama'];

function inferKind(asset) {
  if (asset.kind) return asset.kind;
  if (asset.type === 'image') return 'image';
  if (asset.type === 'video') return asset.sourceUrl ? 'image-to-video' : 'video';
  if (asset.type === 'audio') return 'audio';
  return 'image';
}

export default function AssetEditor({ asset, onClose, onDone }) {
  const { enqueue } = useQueue();

  const [prompt, setPrompt] = useState(asset.prompt || '');
  const [model, setModel] = useState(asset.model || '');
  const [style, setStyle] = useState(asset.style || '');
  const [aspectRatio, setAspectRatio] = useState(asset.aspectRatio || '1:1');
  const [resolution, setResolution] = useState(asset.resolution || '480p');
  const [duration, setDuration] = useState(asset.duration ?? 5);
  const [negativePrompt, setNegativePrompt] = useState(asset.negativePrompt || '');
  const [voice, setVoice] = useState(asset.voice || 'Morgan Freeman');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const kind = useMemo(() => inferKind(asset), [asset]);

  const handleRerun = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post(`/assets/${asset._id}/rerun`, {
        prompt: prompt.trim(),
        model: model || undefined,
        style: style || undefined,
        aspectRatio: aspectRatio || undefined,
        resolution: resolution || undefined,
        duration,
        negativePrompt: negativePrompt || undefined,
        voice: kind === 'audio' ? voice : undefined,
      });

      const { projectId, kind: responseKind, prompt: responsePrompt, params } = res.data;

      await enqueue({
        kind: responseKind,
        prompt: responsePrompt,
        payload: params,
        existingProjectId: projectId,
      });

      onDone?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Re-run failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Panel className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5">
          <div className="min-w-0">
            <p className="text-[var(--text-sm)] font-medium">Edit & re-run</p>
            <p className="text-[10px] text-[var(--text-tertiary)]">{kind}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          <Field label="Prompt" hint={`${prompt.length}/2000`}>
            <TextArea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              maxLength={2000}
            />
          </Field>

          {kind === 'image' && (
            <>
              <Field label="Style">
                <div className="flex flex-wrap gap-1.5">
                  {IMAGE_STYLES.map((s) => (
                    <Chip key={s} active={style === s} onClick={() => setStyle(s)}>{s}</Chip>
                  ))}
                </div>
              </Field>

              <Field label="Aspect ratio">
                <div className="flex flex-wrap gap-1.5">
                  {RATIOS.map((r) => (
                    <Chip key={r} active={aspectRatio === r} onClick={() => setAspectRatio(r)}>{r}</Chip>
                  ))}
                </div>
              </Field>

              <Field label="Model">
                <Select value={model} onChange={(e) => setModel(e.target.value)}>
                  <option value="">Default</option>
                  {IMAGE_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                </Select>
              </Field>

              <Field label="Negative prompt">
                <TextArea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  rows={2}
                  placeholder="blurry, watermark, low quality…"
                />
              </Field>
            </>
          )}

          {(kind === 'video' || kind === 'image-to-video') && (
            <>
              <Field label="Resolution">
                <Select value={resolution} onChange={(e) => setResolution(e.target.value)}>
                  {RESOLUTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </Select>
              </Field>

              <Slider
                label="Duration"
                value={duration}
                min={3}
                max={15}
                step={1}
                onChange={setDuration}
                formatValue={(v) => `${v}s`}
              />

              <Field label="Model">
                <Select value={model} onChange={(e) => setModel(e.target.value)}>
                  <option value="">Default</option>
                  {VIDEO_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                </Select>
              </Field>
            </>
          )}

          {kind === 'video-to-video' && (
            <>
              <Field label="Art style">
                <div className="flex flex-wrap gap-1.5">
                  {VIDEO_STYLES.map((s) => (
                    <Chip key={s} active={style === s} onClick={() => setStyle(s)}>{s}</Chip>
                  ))}
                </div>
              </Field>

              <Slider
                label="Duration"
                value={duration}
                min={3}
                max={15}
                step={1}
                onChange={setDuration}
                formatValue={(v) => `${v}s`}
              />
            </>
          )}

          {kind === 'audio' && (
            <Field label="Voice">
              <Select value={voice} onChange={(e) => setVoice(e.target.value)}>
                {VOICES.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </Field>
          )}

          {kind === 'voice-clone' && (
            <p className="text-[var(--text-xs)] text-[var(--text-tertiary)]">
              Uses the original voice sample. Only the script can be edited here.
            </p>
          )}

          {error && (
            <p className="rounded-[var(--radius-md)] bg-[var(--danger)]/10 px-3 py-2 text-[var(--text-xs)] text-[var(--danger)]">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-4 py-3">
          <p className="text-[10px] text-[var(--text-quaternary)]">
            Re-running generates a new asset · credits apply
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleRerun} loading={submitting}>
              {submitting ? 'Submitting…' : 'Re-run'}
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}