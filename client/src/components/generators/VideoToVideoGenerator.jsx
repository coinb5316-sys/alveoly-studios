import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useHistory } from '../../hooks/useHistory';
import {
  Button, Chip, Field, TextArea, Slider, ProgressBar, Panel, IconButton,
} from '../ui';
import MediaPlayer from '../studio/MediaPlayer';
import api from '../../api/axios';

const ART_STYLES = [
  { id: 'Retro Anime', label: 'Retro Anime' },
  { id: '3D Render', label: '3D Render' },
  { id: 'Oil Painting', label: 'Oil Painting' },
  { id: 'Cyberpunk', label: 'Cyberpunk' },
  { id: 'Vintage Film', label: 'Vintage Film' },
  { id: 'Watercolor', label: 'Watercolor' },
];

const UPLOAD_KEY = 'alveoly_v2v_upload';

export default function VideoToVideoGenerator() {
  const { enqueue, jobs } = useQueue();
  const history = useHistory('video-to-video');
  const fileInputRef = useRef(null);

  const [videoUrl, setVideoUrl] = useState(() => {
    try { return sessionStorage.getItem(UPLOAD_KEY) || null; } catch { return null; }
  });
  const [videoPreview, setVideoPreview] = useState(() => {
    try { return sessionStorage.getItem(UPLOAD_KEY) || null; } catch { return null; }
  });

  const [prompt, setPrompt] = useState('');
  const [artStyle, setArtStyle] = useState('Retro Anime');
  const [duration, setDuration] = useState(5);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const videoJobs = jobs.filter((j) => j.kind === 'video-to-video');
  const latest = videoJobs[0];
  const busy = latest && (latest.status === 'processing' || latest.status === 'queued');

  useEffect(() => {
    try {
      if (videoUrl) sessionStorage.setItem(UPLOAD_KEY, videoUrl);
    } catch { /* ignore quota */ }
  }, [videoUrl]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setVideoPreview(localUrl);
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setVideoUrl(res.data.url);
      URL.revokeObjectURL(localUrl);
      setVideoPreview(res.data.url);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
      setVideoPreview(null);
      setVideoUrl(null);
      try { sessionStorage.removeItem(UPLOAD_KEY); } catch { /* ignore */ }
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!videoUrl || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const id = await enqueue({
        kind: 'video-to-video',
        prompt: prompt.trim() || artStyle,
        payload: {
          videoUrl,
          artStyle,
          prompt: prompt.trim() || `Apply ${artStyle} style`,
          endSeconds: duration,
        },
      });
      history.add({
        id,
        url: null,
        prompt: prompt.trim() || artStyle,
        style: artStyle,
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    videoJobs.forEach((j) => {
      if (j.status === 'done' && j.url) {
        const ex = history.items.find((h) => h.id === j.id);
        if (ex && !ex.url) {
          history.remove(j.id);
          history.add({ id: j.id, url: j.url, prompt: j.prompt, style: artStyle });
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
          <span className="text-[var(--text-secondary)]">Video to Video</span>
        </div>
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">
          Video to Video
        </h1>
        <p className="mt-0.5 text-[var(--text-sm)] text-[var(--text-tertiary)]">
          Restyle existing footage with a new art direction.
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
                  <p className="text-[var(--text-sm)] font-medium">Restyling footage…</p>
                </div>
              ) : videoPreview ? (
                <video
                  src={videoPreview}
                  controls
                  className="h-full w-full object-contain"
                  onContextMenu={(e) => e.preventDefault()}
                  disablePictureInPicture
                  controlsList="nodownload noplaybackrate noremoteplayback"
                />
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[var(--border-default)] px-10 py-14 transition hover:border-[var(--brand-500)]/40"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--text-quaternary)]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="5" width="15" height="14" rx="2" />
                      <path d="m17 9 5-3v12l-5-3V9Z" />
                    </svg>
                  </div>
                  <p className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">
                    Click to upload a video
                  </p>
                  <p className="text-[var(--text-xs)] text-[var(--text-tertiary)]">
                    MP4, WebM, MOV · max 50MB
                  </p>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
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
              {videoUrl ? 'Change video' : 'Upload video'}
            </Button>

            <Field label="Art style" className="mt-4">
              <div className="flex flex-wrap gap-1.5">
                {ART_STYLES.map((s) => (
                  <Chip
                    key={s.id}
                    active={artStyle === s.id}
                    onClick={() => setArtStyle(s.id)}
                  >
                    {s.label}
                  </Chip>
                ))}
              </div>
            </Field>

            <Field label="Custom prompt (optional)" className="mt-4">
              <TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Additional style direction — e.g. 'bold outlines, saturated colors'"
              />
            </Field>

            <div className="mt-4">
              <Slider
                label="Duration"
                value={duration}
                min={3}
                max={15}
                step={1}
                onChange={setDuration}
                formatValue={(v) => `${v}s`}
              />
            </div>

            {error && (
              <p className="mt-3 rounded-[var(--radius-md)] bg-[var(--danger)]/10 px-3 py-2 text-[var(--text-xs)] text-[var(--danger)]">
                {error}
              </p>
            )}

            <Button
              onClick={handleGenerate}
              loading={submitting}
              disabled={!videoUrl}
              size="lg"
              className="mt-4 w-full"
            >
              {submitting ? 'Submitting…' : 'Restyle video'}
            </Button>
            <p className="mt-2 text-center text-[10px] text-[var(--text-quaternary)]">
              Costs 3 credits · ~90s
            </p>

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