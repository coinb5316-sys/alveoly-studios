import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useHistory } from '../../hooks/useHistory';
import { Button, Field, TextArea, ProgressBar, Panel, IconButton, Select } from '../ui';
import api from '../../api/axios';

const UPLOAD_KEY = 'alveoly_image_edit_upload';

const MODELS = [
  { id: 'flux-2-klein', label: 'Flux Klein (fast · 5 cr)' },
  { id: 'qwen-edit', label: 'Qwen Edit (10 cr)' },
  { id: 'seedream-v4', label: 'Seedream (40 cr)' },
];

export default function ImageEditorGenerator() {
  const { enqueue, jobs } = useQueue();
  const history = useHistory('image-edit');
  const fileInputRef = useRef(null);

  const [imageUrl, setImageUrl] = useState(() => sessionStorage.getItem(UPLOAD_KEY) || null);
  const [imagePreview, setImagePreview] = useState(() => sessionStorage.getItem(UPLOAD_KEY) || null);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('flux-2-klein');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const jobsForKind = jobs.filter((j) => j.kind === 'image-edit');
  const latest = jobsForKind[0];
  const busy = latest && (latest.status === 'processing' || latest.status === 'queued');

  useEffect(() => {
    if (imageUrl) sessionStorage.setItem(UPLOAD_KEY, imageUrl);
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
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
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
    if (!imageUrl || !prompt.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const id = await enqueue({
        kind: 'image-edit',
        prompt: prompt.trim(),
        payload: { imageUrl, prompt: prompt.trim(), model, sourceUrl: imageUrl },
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
  }, [jobsForKind.map((j) => `${j.id}:${j.status}:${j.url ?? ''}`).join('|')]);

  const download = async (url, name = 'edit') => {
    if (!url) return;
    try {
      const res = await fetch(url, { mode: 'cors' });
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl; a.download = `alveoly-${name}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    } catch { setError('Download failed'); }
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <header className="mb-6">
        <div className="mb-1 flex items-center gap-2 text-[var(--text-xs)] text-[var(--text-tertiary)]">
          <Link to="/dashboard" className="hover:text-[var(--text-primary)]">Home</Link><span>/</span><span>Image Editor</span>
        </div>
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">AI Image Editor</h1>
        <p className="mt-0.5 text-[var(--text-sm)] text-[var(--text-tertiary)]">Edit any image with a prompt.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-4">
          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5">
              <span className="text-[var(--text-xs)] font-medium text-[var(--text-secondary)]">Preview</span>
              {latest?.url && <IconButton onClick={() => download(latest.url, latest.prompt)} title="Download">↓</IconButton>}
            </div>
            <div className="relative flex aspect-square w-full items-center justify-center bg-[var(--surface-1)]" onContextMenu={(e) => e.preventDefault()}>
              {latest?.url ? (
                <img src={latest.url} alt="Edited" className="h-full w-full object-contain" draggable={false} />
              ) : busy ? (
                <div className="flex flex-col items-center gap-4"><div className="h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-[var(--brand-500)]" /><p className="text-sm">Editing image…</p></div>
              ) : imagePreview ? (
                <img src={imagePreview} alt="Source" className="h-full w-full object-contain opacity-60" draggable={false} />
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 border-2 border-dashed border-[var(--border-default)] px-10 py-14 hover:border-[var(--brand-500)]/40">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Upload an image to edit</p>
                  <p className="text-xs text-[var(--text-tertiary)]">PNG, JPG, WebP</p>
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

            <Field label="Edit prompt" className="mt-4" hint={`${prompt.length}/500`}>
              <TextArea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} maxLength={500} placeholder="Add sunglasses, change background to a beach, remove the trash can…" />
            </Field>

            <Field label="Model" className="mt-4">
              <Select value={model} onChange={(e) => setModel(e.target.value)}>
                {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </Select>
            </Field>

            {error && <p className="mt-3 rounded bg-[var(--danger)]/10 px-3 py-2 text-xs text-[var(--danger)]">{error}</p>}

            <Button onClick={handleGenerate} loading={submitting} disabled={!imageUrl || !prompt.trim()} size="lg" className="mt-4 w-full">
              {submitting ? 'Submitting…' : 'Edit image'}
            </Button>

            {busy && <div className="mt-4"><ProgressBar value={latest.progress || 0} /></div>}
          </Panel>
        </aside>
      </div>
    </div>
  );
}