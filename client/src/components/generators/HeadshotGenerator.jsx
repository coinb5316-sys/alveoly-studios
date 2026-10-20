import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useHistory } from '../../hooks/useHistory';
import { Button, Field, TextArea, ProgressBar, Panel, IconButton, Chip } from '../ui';
import api from '../../api/axios';

const UPLOAD_KEY = 'alveoly_headshot_upload';

const PRESETS = [
  { id: 'corporate', label: 'Corporate', prompt: 'Professional corporate headshot with neutral background, natural lighting, business attire' },
  { id: 'creative',  label: 'Creative',  prompt: 'Creative studio headshot with soft lighting, artistic background, casual modern attire' },
  { id: 'linkedin',  label: 'LinkedIn',  prompt: 'LinkedIn-style headshot, clean studio background, friendly confident smile, business casual' },
  { id: 'actor',     label: 'Actor',     prompt: 'Dramatic actor headshot with textured background, cinematic lighting, expressive look' },
  { id: 'graduation',label: 'Graduation',prompt: 'Professional graduation headshot, formal attire, neutral academic background' },
];

export default function HeadshotGenerator() {
  const { enqueue, jobs } = useQueue();
  const history = useHistory('headshot');
  const fileInputRef = useRef(null);

  const [imageUrl, setImageUrl] = useState(() => {
    try { return sessionStorage.getItem(UPLOAD_KEY) || null; } catch { return null; }
  });
  const [imagePreview, setImagePreview] = useState(() => {
    try { return sessionStorage.getItem(UPLOAD_KEY) || null; } catch { return null; }
  });

  const [preset, setPreset] = useState('corporate');
  const [prompt, setPrompt] = useState(PRESETS[0].prompt);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const jobsForKind = jobs.filter((j) => j.kind === 'headshot');
  const latest = jobsForKind[0];
  const busy = latest && (latest.status === 'processing' || latest.status === 'queued');

  useEffect(() => {
    try {
      if (imageUrl) sessionStorage.setItem(UPLOAD_KEY, imageUrl);
    } catch { /* ignore */ }
  }, [imageUrl]);

  // Sync preset → prompt
  useEffect(() => {
    const found = PRESETS.find((p) => p.id === preset);
    if (found) setPrompt(found.prompt);
  }, [preset]);

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
    setSubmitting(true);
    setError('');
    try {
      const id = await enqueue({
        kind: 'headshot',
        prompt: prompt.trim(),
        payload: {
          imageUrl,
          prompt: prompt.trim(),
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

  const download = async (url, name = 'headshot') => {
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
          <span className="text-[var(--text-secondary)]">Headshot</span>
        </div>
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">Headshot Generator</h1>
        <p className="mt-0.5 text-[var(--text-sm)] text-[var(--text-tertiary)]">
          Turn a selfie into a professional headshot in seconds.
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
              className="relative flex aspect-[3/4] max-h-[600px] w-full items-center justify-center bg-[var(--surface-1)]"
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
                  <p className="text-[var(--text-sm)] font-medium">Generating headshot…</p>
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
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                  <p className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">
                    Upload a selfie
                  </p>
                  <p className="text-[var(--text-xs)] text-[var(--text-tertiary)]">
                    Front-facing, single subject, good lighting
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
              {imageUrl ? 'Change selfie' : 'Upload selfie'}
            </Button>

            <Field label="Style preset" className="mt-4">
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <Chip
                    key={p.id}
                    active={preset === p.id}
                    onClick={() => setPreset(p.id)}
                  >
                    {p.label}
                  </Chip>
                ))}
              </div>
            </Field>

            <Field label="Custom prompt" className="mt-4" hint={`${prompt.length}/500`}>
              <TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Describe the look you want…"
              />
            </Field>

            <p className="mt-3 text-center text-[10px] text-[var(--text-quaternary)]">
              Costs ~50 credits · ~30s
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
              {submitting ? 'Submitting…' : 'Generate headshot'}
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