import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useHistory } from '../../hooks/useHistory';
import { Button, Field, Select, Slider, ProgressBar, Panel, IconButton } from '../ui';
import MediaPlayer from '../studio/MediaPlayer';
import api from '../../api/axios';

const UPLOAD_KEY = 'alveoly_translate_upload';

const LANGUAGES = [
  { id: 'Spanish', label: 'Spanish' },
  { id: 'French', label: 'French' },
  { id: 'German', label: 'German' },
  { id: 'Portuguese', label: 'Portuguese' },
  { id: 'Italian', label: 'Italian' },
  { id: 'Japanese', label: 'Japanese' },
  { id: 'Korean', label: 'Korean' },
  { id: 'Mandarin Chinese', label: 'Mandarin Chinese' },
  { id: 'Hindi', label: 'Hindi' },
  { id: 'Arabic', label: 'Arabic' },
  { id: 'Russian', label: 'Russian' },
  { id: 'Turkish', label: 'Turkish' },
  { id: 'Dutch', label: 'Dutch' },
  { id: 'Polish', label: 'Polish' },
  { id: 'Swedish', label: 'Swedish' },
  { id: 'Indonesian', label: 'Indonesian' },
  { id: 'Vietnamese', label: 'Vietnamese' },
  { id: 'Thai', label: 'Thai' },
];

export default function TranslatorGenerator() {
  const { enqueue, jobs } = useQueue();
  const history = useHistory('translate');
  const fileInputRef = useRef(null);

  const [videoUrl, setVideoUrl] = useState(() => {
    try { return sessionStorage.getItem(UPLOAD_KEY) || null; } catch { return null; }
  });
  const [videoPreview, setVideoPreview] = useState(() => {
    try { return sessionStorage.getItem(UPLOAD_KEY) || null; } catch { return null; }
  });

  const [language, setLanguage] = useState('Spanish');
  const [duration, setDuration] = useState(5);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const jobsForKind = jobs.filter((j) => j.kind === 'translate');
  const latest = jobsForKind[0];
  const busy = latest && (latest.status === 'processing' || latest.status === 'queued');

  useEffect(() => {
    try {
      if (videoUrl) sessionStorage.setItem(UPLOAD_KEY, videoUrl);
    } catch { /* ignore */ }
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
        kind: 'translate',
        prompt: `Translate to ${language}`,
        payload: {
          videoUrl,
          targetLanguage: language,
          endSeconds: duration,
          sourceUrl: videoUrl,
        },
      });
      history.add({
        id,
        url: null,
        prompt: `Translate to ${language}`,
        source: videoUrl,
      });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || '';
      if (msg.includes('402') || /insufficient/i.test(msg)) {
        setError(
          'Not enough Magic Hour credits. Add credits or reduce the duration (5s costs the least).'
        );
      } else {
        setError(msg);
      }
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
          history.add({ id: j.id, url: j.url, prompt: j.prompt, source: videoUrl });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobsForKind.map((j) => `${j.id}:${j.status}:${j.url ?? ''}`).join('|')]);

  const download = async (url, name = 'translated') => {
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
          <span className="text-[var(--text-secondary)]">Translator</span>
        </div>
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">AI Video Translator</h1>
        <p className="mt-0.5 text-[var(--text-sm)] text-[var(--text-tertiary)]">
          Translate spoken audio into another language.
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
                  <p className="text-[var(--text-sm)] font-medium">Translating to {language}…</p>
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
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
                    </svg>
                  </div>
                  <p className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">
                    Upload a video
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

            <Field label="Target language" className="mt-4">
              <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </Select>
            </Field>

            <div className="mt-4">
              <Slider
                label="Duration to process"
                value={duration}
                min={5}
                max={10}
                step={5}
                onChange={setDuration}
                formatValue={(v) => `${v}s`}
              />
            </div>

            <p className="mt-3 text-[10px] leading-4 text-[var(--text-quaternary)]">
              Translates the speech track and regenerates it in the target language. Lip motion is preserved.
            </p>

            <p className="mt-3 text-center text-[10px] text-[var(--text-quaternary)]">
              Costs ~{Math.round(duration * 24)} credits · ~90s
            </p>

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
              {submitting ? 'Submitting…' : `Translate to ${language}`}
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