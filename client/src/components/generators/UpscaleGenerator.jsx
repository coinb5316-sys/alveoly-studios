import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useHistory } from '../../hooks/useHistory';
import {
  Button, Field, TextArea, ProgressBar, Panel, Chip, IconButton,
} from '../ui';
import api from '../../api/axios';

const UPLOAD_KEY = 'alveoly_upscale_upload';

const SCALES = [
  { id: 2, label: '2×', note: '25–50 credits' },
  { id: 4, label: '4×', note: '100–200 credits' },
];

const MODES = [
  { id: 'preserve', label: 'Preserve', note: 'Keeps the original details' },
  { id: 'balanced', label: 'Balanced', note: 'Clean up + enhance' },
  { id: 'creative', label: 'Creative', note: 'Adds detail via prompt' },
];

// Cost matrix from Magic Hour docs
const COST = {
  '2-preserve': 25,
  '2-balanced': 50,
  '2-creative': 50,
  '4-preserve': 100,
  '4-balanced': 200,
  '4-creative': 200,
};

export default function UpscaleGenerator() {
  const { enqueue, jobs } = useQueue();
  const history = useHistory('upscale');
  const fileInputRef = useRef(null);

  const [imageUrl, setImageUrl] = useState(() => {
    try { return sessionStorage.getItem(UPLOAD_KEY) || null; } catch { return null; }
  });
  const [imagePreview, setImagePreview] = useState(() => {
    try { return sessionStorage.getItem(UPLOAD_KEY) || null; } catch { return null; }
  });

  const [scale, setScale] = useState(2);
  const [mode, setMode] = useState('balanced');
  const [prompt, setPrompt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const jobsForKind = jobs.filter((j) => j.kind === 'upscale');
  const latest = jobsForKind[0];
  const busy = latest && (latest.status === 'processing' || latest.status === 'queued');

  const estimatedCost = COST[`${scale}-${mode}`] ?? 50;

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
    if (!imageUrl || submitting) return;
    if (mode === 'creative' && !prompt.trim()) {
      setError('Creative mode needs a prompt to guide the enhancement');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const id = await enqueue({
        kind: 'upscale',
        prompt: `Upscale ${scale}× · ${mode}`,
        payload: {
          imageUrl,
          scaleFactor: scale,
          mode,
          prompt: mode === 'creative' ? prompt.trim() : undefined,
        },
      });
      history.add({
        id,
        url: null,
        prompt: `Upscale ${scale}× · ${mode}`,
        source: imageUrl,
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Sync completed jobs to history
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

  // Blob download
  const download = async (url, name = 'upscale') => {
    if (!url) return;
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const slug = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'alveoly';
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `alveoly-${slug}.png`;
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
          <span className="text-[var(--text-secondary)]">Upscale</span>
        </div>
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">Image Upscaler</h1>
        <p className="mt-0.5 text-[var(--text-sm)] text-[var(--text-tertiary)]">
          Enhance resolution up to 4× with detail-preserving modes.
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
              className="relative flex aspect-square w-full items-center justify-center bg-[var(--surface-1)]"
              onContextMenu={(e) => e.preventDefault()}
            >
              {latest?.url ? (
                <img
                  src={latest.url}
                  alt={latest.prompt}
                  draggable={false}
                  className="h-full w-full object-contain"
                  onContextMenu={(e) => e.preventDefault()}
                />
              ) : busy ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-2 border-[var(--border-default)]" />
                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[var(--brand-500)]" />
                  </div>
                  <p className="text-[var(--text-sm)] font-medium">Upscaling…</p>
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
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <path d="M12 16V8M9 11l3-3 3 3" />
                    </svg>
                  </div>
                  <p className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">
                    Upload an image to upscale
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

            <Field label="Scale factor" className="mt-4">
              <div className="grid grid-cols-2 gap-1.5">
                {SCALES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setScale(s.id)}
                    className={`rounded-[var(--radius-md)] border px-2.5 py-2 text-left transition ${
                      scale === s.id
                        ? 'border-[var(--brand-500)]/60 bg-[var(--brand-600)]/10'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                    }`}
                  >
                    <p className={`text-[var(--text-sm)] font-medium ${scale === s.id ? 'text-[var(--brand-300)]' : 'text-[var(--text-primary)]'}`}>
                      {s.label}
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{s.note}</p>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Mode" className="mt-4">
              <div className="flex flex-wrap gap-1.5">
                {MODES.map((m) => (
                  <Chip key={m.id} active={mode === m.id} onClick={() => setMode(m.id)}>
                    {m.label}
                  </Chip>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] leading-4 text-[var(--text-quaternary)]">
                {MODES.find((m) => m.id === mode)?.note}
              </p>
            </Field>

            {mode === 'creative' && (
              <Field label="Creative prompt" className="mt-4" hint={`${prompt.length}/500`}>
                <TextArea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Add texture, sharper details, richer colors…"
                />
              </Field>
            )}

            <p className="mt-3 text-center text-[10px] text-[var(--text-quaternary)]">
              Costs ~{estimatedCost} credits · ~20s
            </p>

            {error && (
              <p className="mt-3 rounded-[var(--radius-md)] bg-[var(--danger)]/10 px-3 py-2 text-[var(--text-xs)] text-[var(--danger)]">
                {error}
              </p>
            )}

            <Button
              onClick={handleGenerate}
              loading={submitting}
              disabled={
                !imageUrl ||
                (mode === 'creative' && !prompt.trim())
              }
              size="lg"
              className="mt-4 w-full"
            >
              {submitting ? 'Submitting…' : 'Upscale image'}
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