import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useHistory } from '../../hooks/useHistory';
import { Button, Field, TextArea, Slider, ProgressBar, Panel, IconButton, Chip } from '../ui';
import MediaPlayer from '../studio/MediaPlayer';
import api from '../../api/axios';

const UPLOAD_KEY = 'alveoly_animation_upload';

const ART_STYLES = [
  { id: 'Studio Ghibli Film Still', label: 'Ghibli' },
  { id: 'Retro Anime', label: 'Retro Anime' },
  { id: '3D Render', label: '3D Render' },
  { id: 'Oil Painting', label: 'Oil Painting' },
  { id: 'Watercolor', label: 'Watercolor' },
  { id: 'Cyberpunk', label: 'Cyberpunk' },
];

const CAMERA_EFFECTS = [
  { id: 'Dramatic Zoom In', label: 'Zoom In' },
  { id: 'Dramatic Zoom Out', label: 'Zoom Out' },
  { id: 'Horizontal Pan', label: 'Horizontal Pan' },
  { id: 'Vertical Pan', label: 'Vertical Pan' },
  { id: 'Static', label: 'Static' },
];

export default function AnimationGenerator() {
  const { enqueue, jobs } = useQueue();
  const history = useHistory('animation');
  const fileInputRef = useRef(null);

  const [imageUrl, setImageUrl] = useState(() => {
    try { return sessionStorage.getItem(UPLOAD_KEY) || null; } catch { return null; }
  });
  const [imagePreview, setImagePreview] = useState(() => {
    try { return sessionStorage.getItem(UPLOAD_KEY) || null; } catch { return null; }
  });

  const [prompt, setPrompt] = useState('');
  const [artStyle, setArtStyle] = useState('Studio Ghibli Film Still');
  const [cameraEffect, setCameraEffect] = useState('Dramatic Zoom In');
  const [duration, setDuration] = useState(3);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const jobsForKind = jobs.filter((j) => j.kind === 'animation');
  const latest = jobsForKind[0];
  const busy = latest && (latest.status === 'processing' || latest.status === 'queued');

  useEffect(() => {
    try {
      if (imageUrl) sessionStorage.setItem(UPLOAD_KEY, imageUrl);
    } catch { /* ignore */ }
  }, [imageUrl]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(res.data.url);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
      setImagePreview(null);
      setImageUrl(null);
      try { sessionStorage.removeItem(UPLOAD_KEY); } catch { /* ignore */ }
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!imageUrl || !prompt.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const id = await enqueue({
        kind: 'animation',
        prompt: prompt.trim(),
        payload: {
          imageUrl,
          prompt: prompt.trim(),
          endSeconds: duration,
          artStyle,
          cameraEffect,
          sourceUrl: imageUrl,
        },
      });
      history.add({ id, url: null, prompt: prompt.trim(), source: imageUrl });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    jobsForKind.forEach((j) => {
      if (j.status === 'done' && j.url) {
        const ex = history.items.find((h) => h.id === j.id);
        if (ex && !ex.url) {
          history.remove(j.id);
          history.add({ id: j.id, url: j.url, prompt: j.prompt, source: imageUrl });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobsForKind.map((j) => `${j.id}:${j.status}:${j.url ?? ''}`).join('|')]);

  const download = async (url, name = 'animation') => {
    if (!url) return;
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const slug = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'alveoly';
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
          <span className="text-[var(--text-secondary)]">Animation</span>
        </div>
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">Animation</h1>
        <p className="mt-0.5 text-[var(--text-sm)] text-[var(--text-tertiary)]">
          Turn any image into a stylized animated clip.
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
                <IconButton onClick={() => download(latest.url, latest.prompt)} title="Download">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 4v12m0 0 4-4m-4 4-4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </IconButton>
              )}
            </div>

            <div
              className="relative flex aspect-video w-full items-center justify-center bg-[var(--surface-1)]"
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
                  <p className="text-[var(--text-sm)] font-medium">Animating your image…</p>
                </div>
              ) : imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Source"
                  draggable={false}
                  className="h-full w-full object-contain opacity-70"
                  onContextMenu={(e) => e.preventDefault()}
                />
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[var(--border-default)] px-10 py-14 transition hover:border-[var(--brand-500)]/40"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--text-quaternary)]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M10 8v8l6-4-6-4Z" />
                    </svg>
                  </div>
                  <p className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">
                    Upload an image to animate
                  </p>
                  <p className="text-[var(--text-xs)] text-[var(--text-tertiary)]">
                    PNG, JPG, WebP · max 50MB
                  </p>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </Panel>
        </section>

        <aside>
          <Panel className="p-4">
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              loading={uploading}
            >
              {imageUrl ? 'Change image' : 'Upload image'}
            </Button>

            <Field label="Prompt" className="mt-4" hint={`${prompt.length}/500`}>
              <TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="A character walking through a magical forest…"
              />
            </Field>

            <Field label="Art style" className="mt-4">
              <div className="flex flex-wrap gap-1.5">
                {ART_STYLES.map((s) => (
                  <Chip key={s.id} active={artStyle === s.id} onClick={() => setArtStyle(s.id)}>
                    {s.label}
                  </Chip>
                ))}
              </div>
            </Field>

            <Field label="Camera effect" className="mt-4">
              <div className="flex flex-wrap gap-1.5">
                {CAMERA_EFFECTS.map((c) => (
                  <Chip key={c.id} active={cameraEffect === c.id} onClick={() => setCameraEffect(c.id)}>
                    {c.label}
                  </Chip>
                ))}
              </div>
            </Field>

            <div className="mt-4">
              <Slider
                label="Duration"
                value={duration}
                min={2}
                max={10}
                step={1}
                onChange={setDuration}
                formatValue={(v) => `${v}s`}
              />
            </div>

            <p className="mt-3 text-center text-[10px] text-[var(--text-quaternary)]">
              Costs ~{Math.round(duration * 24)} credits · ~60s
            </p>

            {error && (
              <p className="mt-3 rounded-[var(--radius-md)] bg-[var(--danger)]/10 px-3 py-2 text-[var(--text-xs)] text-[var(--danger)]">
                {error}
              </p>
            )}

            <Button
              onClick={handleGenerate}
              loading={submitting}
              disabled={!imageUrl || !prompt.trim()}
              size="lg"
              className="mt-4 w-full"
            >
              {submitting ? 'Submitting…' : 'Animate image'}
            </Button>

            {busy && (
              <div className="mt-4">
                <ProgressBar value={latest.progress || 0} />
              </div>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}