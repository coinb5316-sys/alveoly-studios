import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useHistory } from '../../hooks/useHistory';
import {
  Button, IconButton, Chip, Field, TextArea, Select, Slider, ProgressBar, Panel,
} from '../ui';
import MediaPlayer from '../studio/MediaPlayer';

const MOTION_PRESETS = [
  { id: 'static', label: 'Static' },
  { id: 'pan',    label: 'Pan' },
  { id: 'zoom',   label: 'Zoom in' },
  { id: 'orbit',  label: 'Orbit' },
  { id: 'dolly',  label: 'Dolly' },
  { id: 'crane',  label: 'Crane' },
];

const MODELS = [
  { id: 'runway-gen3', label: 'Runway Gen-3' },
  { id: 'veo-2',       label: 'Veo 2' },
  { id: 'kling-1.5',   label: 'Kling 1.5' },
];

const RESOLUTIONS = ['720p', '1080p', '4k'];
const DURATIONS = [3, 5, 10];

export default function VideoGenerator() {
  const { enqueue, jobs } = useQueue();
  const history = useHistory('video');

  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('runway-gen3');
  const [motion, setMotion] = useState('pan');
  const [resolution, setResolution] = useState('1080p');
  const [duration, setDuration] = useState(5);
  const [motionStrength, setMotionStrength] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const videoJobs = jobs.filter((j) => j.kind === 'video');
  const latest = videoJobs[0];
  const busy = latest && (latest.status === 'processing' || latest.status === 'queued');

  const handleGenerate = async () => {
    if (!prompt.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const id = await enqueue({
        kind: 'video',
        prompt: prompt.trim(),
        payload: { prompt: prompt.trim(), model, motion, resolution, duration, motionStrength },
      });
      history.add({ id, url: null, prompt: prompt.trim(), resolution, duration });
      setPrompt('');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Sync completed jobs → history (useEffect, not useMemo)
  useEffect(() => {
    videoJobs.forEach((j) => {
      if (j.status === 'done' && j.url) {
        const ex = history.items.find((h) => h.id === j.id);
        if (ex && !ex.url) {
          history.remove(j.id);
          history.add({ id: j.id, url: j.url, prompt: j.prompt, resolution, duration });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoJobs.map((j) => `${j.id}:${j.status}:${j.url ?? ''}`).join('|')]);

  // Blob-based download — hides the Cloudinary URL
  const download = async (url, name = 'video') => {
    if (!url) return;
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const slug = String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 40) || 'alveoly';

      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `alveoly-${slug}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    } catch {
      setError('Download failed. Try again.');
    }
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <header className="mb-6">
        <div className="mb-1 flex items-center gap-2 text-[var(--text-xs)] text-[var(--text-tertiary)]">
          <Link to="/dashboard" className="hover:text-[var(--text-primary)]">Home</Link>
          <span>/</span>
          <span className="text-[var(--text-secondary)]">Video Studio</span>
        </div>
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">Video Studio</h1>
        <p className="mt-0.5 text-[var(--text-sm)] text-[var(--text-tertiary)]">
          Text-to-video with camera motion controls.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-4">
          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5">
              <div className="flex items-center gap-2 text-[var(--text-xs)] text-[var(--text-tertiary)]">
                <span className="font-medium text-[var(--text-secondary)]">Preview</span>
                {latest && (
                  <>
                    <span>·</span>
                    <span className="font-mono">{latest.status}</span>
                  </>
                )}
              </div>
              {latest?.url && (
                <div className="flex gap-1">
                  <IconButton onClick={() => download(latest.url, latest.prompt)} title="Download MP4">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 4v12m0 0 4-4m-4 4-4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </IconButton>
                </div>
              )}
            </div>

            <div
              className="relative flex w-full items-center justify-center bg-[var(--surface-1)]"
              style={{ aspectRatio: '16/9' }}
              onContextMenu={(e) => e.preventDefault()}
            >
              {latest?.url ? (
                <MediaPlayer src={latest.url} kind="video" />
              ) : busy ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-2 border-[var(--border-default)]" />
                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[var(--brand-500)]" />
                  </div>
                  <div className="max-w-[280px] text-center">
                    <p className="text-[var(--text-sm)] font-medium">Rendering video…</p>
                    <p className="mt-1 text-[var(--text-xs)] text-[var(--text-tertiary)]">
                      Takes 60–180s · you can navigate away, it keeps running.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex max-w-xs flex-col items-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--text-quaternary)]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="5" width="15" height="14" rx="2"/>
                      <path d="m17 9 5-3v12l-5-3V9Z"/>
                    </svg>
                  </div>
                  <p className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">No video yet</p>
                  <p className="text-[var(--text-xs)] text-[var(--text-tertiary)]">Describe a scene to generate your first clip.</p>
                </div>
              )}
            </div>
          </Panel>

          <Panel className="p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[var(--text-xs)] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                Recent · {history.items.length}
              </span>
              {history.items.length > 0 && (
                <button onClick={history.clear} className="text-[var(--text-xs)] text-[var(--text-quaternary)] hover:text-[var(--danger)]">Clear</button>
              )}
            </div>
            {history.items.length === 0 ? (
              <p className="py-6 text-center text-[var(--text-xs)] text-[var(--text-quaternary)]">No videos yet</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {history.items.slice(0, 12).map((h) => (
                  <div
                    key={h.id}
                    className="group relative aspect-video overflow-hidden rounded-[var(--radius-md)] bg-[var(--surface-3)]"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    {h.url ? (
                      <video
                        src={h.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                        controls={false}
                        disablePictureInPicture
                        controlsList="nodownload noplaybackrate noremoteplayback"
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="h-3 w-3 animate-spin rounded-full border border-[var(--text-quaternary)] border-t-transparent" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                      <button
                        onClick={() => download(h.url, h.prompt)}
                        className="text-[10px] text-white/80 hover:text-white"
                        aria-label="Download"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => history.remove(h.id)}
                        className="text-[10px] text-white/50 hover:text-[var(--danger)]"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </section>

        <aside className="space-y-4">
          <Panel className="p-4">
            <Field label="Prompt" hint={`${prompt.length}/1000`}>
              <TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                maxLength={1000}
                placeholder="Aerial drone shot over misty mountains at sunrise, cinematic…"
              />
            </Field>

            <Field label="Camera motion" className="mt-4">
              <div className="flex flex-wrap gap-1.5">
                {MOTION_PRESETS.map((m) => (
                  <Chip key={m.id} active={motion === m.id} onClick={() => setMotion(m.id)}>{m.label}</Chip>
                ))}
              </div>
            </Field>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Field label="Model">
                <Select value={model} onChange={(e) => setModel(e.target.value)}>
                  {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </Select>
              </Field>
              <Field label="Resolution">
                <Select value={resolution} onChange={(e) => setResolution(e.target.value)}>
                  {RESOLUTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </Select>
              </Field>
            </div>

            <Field label="Duration" className="mt-4">
              <div className="flex gap-1.5">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`flex-1 rounded-[var(--radius-md)] border py-2 text-[var(--text-sm)] transition ${
                      duration === d
                        ? 'border-[var(--brand-500)]/60 bg-[var(--brand-600)]/10 text-[var(--brand-300)]'
                        : 'border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:border-[var(--border-default)]'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </Field>

            <div className="mt-4">
              <Slider label="Motion strength" value={motionStrength} min={0} max={100} onChange={setMotionStrength} formatValue={(v) => `${v}%`} />
            </div>

            {error && (
              <p className="mt-3 rounded-[var(--radius-md)] bg-[var(--danger)]/10 px-3 py-2 text-[var(--text-xs)] text-[var(--danger)]">{error}</p>
            )}

            <Button onClick={handleGenerate} loading={submitting} disabled={!prompt.trim()} size="lg" className="mt-4 w-full">
              {submitting ? 'Submitting…' : 'Generate video'}
            </Button>
            <p className="mt-2 text-center text-[10px] text-[var(--text-quaternary)]">
              Costs 3 credits · ~90s
            </p>

            {busy && (
              <div className="mt-4 space-y-1.5">
                <ProgressBar value={latest.progress || 0} tone="warning" />
                <p className="text-center text-[10px] text-[var(--text-tertiary)]">{latest.progress ? `${Math.round(latest.progress)}%` : 'Working…'}</p>
              </div>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}