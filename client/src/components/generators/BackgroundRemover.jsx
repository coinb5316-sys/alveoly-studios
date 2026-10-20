import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useHistory } from '../../hooks/useHistory';
import { Button, Field, ProgressBar, Panel } from '../ui';
import MediaPlayer from '../studio/MediaPlayer'; // For video preview if we add it later
import api from '../../api/axios';

const UPLOAD_KEY = 'alveoly_bg_removal_upload';

export default function BackgroundRemover() {
  const { enqueue, jobs } = useQueue();
  const history = useHistory('background-removal');
  const fileInputRef = useRef(null);

  const [imageUrl, setImageUrl] = useState(() => {
    try { return sessionStorage.getItem(UPLOAD_KEY) || null; } catch { return null; }
  });
  const [imagePreview, setImagePreview] = useState(() => {
    try { return sessionStorage.getItem(UPLOAD_KEY) || null; } catch { return null; }
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const jobsForKind = jobs.filter((j) => j.kind === 'background-removal');
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
        kind: 'background-removal',
        prompt: 'Background removal',
        payload: { imageUrl },
      });
      history.add({ id, url: null, prompt: 'Background removed' });
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
          history.add({ id: j.id, url: j.url, prompt: j.prompt });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobsForKind.map((j) => `${j.id}:${j.status}:${j.url ?? ''}`).join('|')]);

  const download = async (url) => {
    try {
      const res = await fetch(url, { mode: 'cors' });
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `alveoly-cutout-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    } catch { setError('Download failed'); }
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <header className="mb-6">
        <div className="mb-1 flex items-center gap-2 text-[var(--text-xs)] text-[var(--text-tertiary)]">
          <Link to="/dashboard" className="hover:text-[var(--text-primary)]">Home</Link>
          <span>/</span>
          <span className="text-[var(--text-secondary)]">Background Remover</span>
        </div>
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">Background Remover</h1>
        <p className="mt-0.5 text-[var(--text-sm)] text-[var(--text-tertiary)]">
          Isolate subjects from any image with precision edge detection.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-4">
          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5">
              <span className="text-[var(--text-xs)] font-medium text-[var(--text-secondary)]">Preview</span>
              {latest?.url && (
                <button onClick={() => download(latest.url)} className="text-[var(--text-xs)] text-[var(--brand-300)] hover:text-[var(--brand-400)]">
                  Download
                </button>
              )}
            </div>
            <div className="relative flex aspect-square w-full items-center justify-center bg-[var(--surface-1)]" onContextMenu={(e) => e.preventDefault()}>
              {latest?.url ? (
                <img src={latest.url} alt="Cutout" draggable={false} className="h-full w-full object-contain" />
              ) : busy ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-[var(--brand-500)]" />
                  <p className="text-[var(--text-sm)] font-medium">Removing background…</p>
                </div>
              ) : imagePreview ? (
                <img src={imagePreview} alt="Source" draggable={false} className="h-full w-full object-contain opacity-50" />
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[var(--border-default)] px-10 py-14 transition hover:border-[var(--brand-500)]/40">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--text-quaternary)]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                  </div>
                  <p className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">Upload an image</p>
                  <p className="text-[var(--text-xs)] text-[var(--text-tertiary)]">PNG, JPG, WebP</p>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </div>
          </Panel>
        </section>

        <aside>
          <Panel className="p-4">
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full" loading={uploading}>
              {imageUrl ? 'Change image' : 'Upload image'}
            </Button>

            {error && <p className="mt-3 rounded-[var(--radius-md)] bg-[var(--danger)]/10 px-3 py-2 text-[var(--text-xs)] text-[var(--danger)]">{error}</p>}

            <Button onClick={handleGenerate} loading={submitting} disabled={!imageUrl} size="lg" className="mt-4 w-full">
              {submitting ? 'Submitting…' : 'Remove background'}
            </Button>
            <p className="mt-2 text-center text-[10px] text-[var(--text-quaternary)]">Costs 1 credit · ~10s</p>

            {busy && <div className="mt-4"><ProgressBar value={latest.progress || 0} /></div>}
          </Panel>
        </aside>
      </div>
    </div>
  );
}