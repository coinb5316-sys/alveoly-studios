import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useHistory } from '../../hooks/useHistory';
import { Button, ProgressBar, Panel, IconButton } from '../ui';
import api from '../../api/axios';

const SOURCE_KEY = 'alveoly_faceswap_source';
const TARGET_KEY = 'alveoly_faceswap_target';

export default function FaceSwapGenerator() {
  const { enqueue, jobs } = useQueue();
  const history = useHistory('face-swap');
  const sourceInputRef = useRef(null);
  const targetInputRef = useRef(null);

  const [sourceUrl, setSourceUrl] = useState(() => sessionStorage.getItem(SOURCE_KEY) || null);
  const [sourcePreview, setSourcePreview] = useState(() => sessionStorage.getItem(SOURCE_KEY) || null);
  const [targetUrl, setTargetUrl] = useState(() => sessionStorage.getItem(TARGET_KEY) || null);
  const [targetPreview, setTargetPreview] = useState(() => sessionStorage.getItem(TARGET_KEY) || null);

  const [agreed, setAgreed] = useState(false);
  const [uploading, setUploading] = useState({ source: false, target: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const jobsForKind = jobs.filter((j) => j.kind === 'face-swap');
  const latest = jobsForKind[0];
  const busy = latest && (latest.status === 'processing' || latest.status === 'queued');

  useEffect(() => {
    if (sourceUrl) sessionStorage.setItem(SOURCE_KEY, sourceUrl);
    if (targetUrl) sessionStorage.setItem(TARGET_KEY, targetUrl);
  }, [sourceUrl, targetUrl]);

  const handleUpload = async (file, type) => {
    setUploading((prev) => ({ ...prev, [type]: true }));
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (type === 'source') { setSourceUrl(res.data.url); setSourcePreview(res.data.url); }
      else { setTargetUrl(res.data.url); setTargetPreview(res.data.url); }
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleGenerate = async () => {
    if (!sourceUrl || !targetUrl || !agreed || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const id = await enqueue({
        kind: 'face-swap',
        prompt: 'Face swap',
        payload: { sourceUrl, targetUrl, agreedToTerms: true },
      });
      history.add({ id, url: null, prompt: 'Face swap', source: targetUrl });
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
          history.add({ id: j.id, url: j.url, prompt: j.prompt, source: targetUrl });
        }
      }
    });
  }, [jobsForKind.map((j) => `${j.id}:${j.status}:${j.url ?? ''}`).join('|')]);

  const download = async (url, name = 'faceswap') => {
    if (!url) return;
    try {
      const res = await fetch(url, { mode: 'cors' });
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `alveoly-${name}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    } catch { setError('Download failed'); }
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <header className="mb-6">
        <div className="mb-1 flex items-center gap-2 text-[var(--text-xs)] text-[var(--text-tertiary)]">
          <Link to="/dashboard" className="hover:text-[var(--text-primary)]">Home</Link><span>/</span><span>Face Swap</span>
        </div>
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">Face Swap Photo</h1>
        <p className="mt-0.5 text-[var(--text-sm)] text-[var(--text-tertiary)]">Replace a face in any photo with another.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-4">
          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5">
              <span className="text-[var(--text-xs)] font-medium text-[var(--text-secondary)]">Preview</span>
              {latest?.url && <IconButton onClick={() => download(latest.url)} title="Download">↓</IconButton>}
            </div>
            <div className="relative flex aspect-square w-full items-center justify-center bg-[var(--surface-1)]" onContextMenu={(e) => e.preventDefault()}>
              {latest?.url ? (
                <img src={latest.url} alt="Face swap result" className="h-full w-full object-contain" draggable={false} />
              ) : busy ? (
                <div className="flex flex-col items-center gap-4"><div className="h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-[var(--brand-500)]" /><p className="text-sm">Swapping faces…</p></div>
              ) : targetPreview ? (
                <img src={targetPreview} alt="Target" className="h-full w-full object-contain opacity-50" draggable={false} />
              ) : (
                <button onClick={() => targetInputRef.current?.click()} className="flex flex-col items-center gap-3 border-2 border-dashed border-[var(--border-default)] px-10 py-14 hover:border-[var(--brand-500)]/40">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Upload target image</p>
                  <p className="text-xs text-[var(--text-tertiary)]">The photo where the face will be replaced</p>
                </button>
              )}
              <input ref={targetInputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'target')} className="hidden" />
            </div>
          </Panel>
        </section>

        <aside>
          <Panel className="p-4">
            <Button variant="secondary" onClick={() => sourceInputRef.current?.click()} className="w-full" loading={uploading.source}>
              {sourceUrl ? 'Change source face' : 'Upload source face'}
            </Button>
            <input ref={sourceInputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'source')} className="hidden" />
            {sourcePreview && <img src={sourcePreview} alt="Source face" className="mt-2 h-20 w-20 rounded-md object-cover" />}

            <Button variant="secondary" onClick={() => targetInputRef.current?.click()} className="mt-2 w-full" loading={uploading.target}>
              {targetUrl ? 'Change target image' : 'Upload target image'}
            </Button>

            <label className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-[var(--text-tertiary)]">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-[var(--brand-500)]" />
              I confirm I have permission to use both images and understand face swap results are my responsibility.
            </label>

            <p className="mt-3 text-center text-[10px] text-[var(--text-quaternary)]">Costs ~10 credits · ~20s</p>

            {error && <p className="mt-3 rounded bg-[var(--danger)]/10 px-3 py-2 text-xs text-[var(--danger)]">{error}</p>}

            <Button onClick={handleGenerate} loading={submitting} disabled={!sourceUrl || !targetUrl || !agreed} size="lg" className="mt-4 w-full">
              {submitting ? 'Submitting…' : 'Swap faces'}
            </Button>

            {busy && <div className="mt-4"><ProgressBar value={latest.progress || 0} /></div>}
          </Panel>
        </aside>
      </div>
    </div>
  );
}