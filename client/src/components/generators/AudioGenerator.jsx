import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useHistory } from '../../hooks/useHistory';
import {
  Button, Chip, Field, TextArea, ProgressBar, Panel,
} from '../ui';
import MediaPlayer from '../studio/MediaPlayer';
import api from '../../api/axios';

const MODES = [
  { id: 'voiceover', label: 'Voiceover', enabled: true },
  { id: 'voice-clone', label: 'Clone Voice', enabled: true },
  { id: 'music', label: 'Music', enabled: false, note: 'Coming soon' },
  { id: 'sfx', label: 'Sound FX', enabled: false, note: 'Coming soon' },
];

const VOICES = [
  { id: 'Morgan Freeman', label: 'Morgan Freeman', meta: 'M · US' },
  { id: 'Joe Rogan', label: 'Joe Rogan', meta: 'M · US' },
  { id: 'Donald Trump', label: 'Donald Trump', meta: 'M · US' },
  { id: 'Elon Musk', label: 'Elon Musk', meta: 'M · US' },
  { id: 'Barack Obama', label: 'Barack Obama', meta: 'M · US' },
];

const MOODS = ['Cinematic', 'Ambient', 'Upbeat', 'Dark', 'Lo-fi', 'Epic', 'Calm', 'Tense'];

const CLONE_SAMPLE_KEY = 'alveoly_voice_clone_sample';

export default function AudioGenerator() {
  const { enqueue, jobs } = useQueue();
  const history = useHistory('audio');
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState('voiceover');
  const [prompt, setPrompt] = useState('');
  const [voice, setVoice] = useState('Morgan Freeman');
  const [mood, setMood] = useState('Cinematic');
  const [length, setLength] = useState(15);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [cloneAudioUrl, setCloneAudioUrl] = useState(() => {
    try { return sessionStorage.getItem(CLONE_SAMPLE_KEY) || null; } catch { return null; }
  });
  const [cloneAudioPreview, setCloneAudioPreview] = useState(() => {
    try { return sessionStorage.getItem(CLONE_SAMPLE_KEY) || null; } catch { return null; }
  });
  const [uploadingSample, setUploadingSample] = useState(false);

  const audioJobs = jobs.filter((j) => j.kind === 'audio' || j.kind === 'voice-clone');
  const latest = audioJobs[0];
  const busy = latest && (latest.status === 'processing' || latest.status === 'queued');

  useEffect(() => {
    try {
      if (cloneAudioUrl) sessionStorage.setItem(CLONE_SAMPLE_KEY, cloneAudioUrl);
    } catch { /* ignore */ }
  }, [cloneAudioUrl]);

  const handleSampleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCloneAudioPreview(URL.createObjectURL(file));
    setUploadingSample(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCloneAudioUrl(res.data.url);
      setCloneAudioPreview(res.data.url);
    } catch (err) {
      setError(err.response?.data?.error || 'Sample upload failed');
      setCloneAudioPreview(null);
      setCloneAudioUrl(null);
      try { sessionStorage.removeItem(CLONE_SAMPLE_KEY); } catch { /* ignore */ }
    } finally {
      setUploadingSample(false);
    }
  };

  const clearSample = () => {
    setCloneAudioUrl(null);
    setCloneAudioPreview(null);
    try { sessionStorage.removeItem(CLONE_SAMPLE_KEY); } catch { /* ignore */ }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || submitting) return;

    if (mode === 'voice-clone' && !cloneAudioUrl) {
      setError('Please upload a voice sample first (3–30 seconds)');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const isClone = mode === 'voice-clone';
      const kind = isClone ? 'voice-clone' : 'audio';

      const payload = isClone
        ? { audioUrl: cloneAudioUrl, prompt: prompt.trim() }
        : {
            mode,
            prompt: prompt.trim(),
            voice: mode === 'voiceover' ? voice : undefined,
            mood: mode !== 'voiceover' ? mood : undefined,
            length: mode !== 'voiceover' ? length : undefined,
          };

      const id = await enqueue({ kind, prompt: prompt.trim(), payload });
      history.add({ id, url: null, prompt: prompt.trim(), mode });
      setPrompt('');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    audioJobs.forEach((j) => {
      if (j.status === 'done' && j.url) {
        const ex = history.items.find((h) => h.id === j.id);
        if (ex && !ex.url) {
          history.remove(j.id);
          history.add({ id: j.id, url: j.url, prompt: j.prompt, mode });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioJobs.map((j) => `${j.id}:${j.status}:${j.url ?? ''}`).join('|')]);

  // Blob-based download — hides the Cloudinary URL from the browser
  const download = async (url, name = 'audio') => {
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
      a.download = `alveoly-${slug}.mp3`;
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
          <span className="text-[var(--text-secondary)]">Audio Studio</span>
        </div>
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">Audio Studio</h1>
        <p className="mt-0.5 text-[var(--text-sm)] text-[var(--text-tertiary)]">
          Voice, cloning, music, and sound design — all in one place.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-4">
          <Panel className="p-6">
            {latest?.url ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                      {latest.prompt}
                    </p>
                    <p className="mt-0.5 text-[var(--text-xs)] text-[var(--text-tertiary)]">
                      {latest.kind === 'voice-clone'
                        ? 'Cloned voice'
                        : mode === 'voiceover'
                          ? `Voice · ${voice}`
                          : `Mood · ${mood}`}
                    </p>
                  </div>
                  <button
                    onClick={() => download(latest.url, latest.prompt)}
                    className="shrink-0 rounded-md border border-[var(--border-subtle)] px-2.5 py-1 text-[var(--text-xs)] text-[var(--brand-300)] transition hover:border-[var(--border-default)] hover:text-[var(--brand-400)]"
                  >
                    Download
                  </button>
                </div>

                {/* Custom player — no native controls */}
                <MediaPlayer src={latest.url} kind="audio" />
              </div>
            ) : busy ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <Waveform />
                <p className="text-[var(--text-sm)] font-medium">Synthesizing…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--text-quaternary)]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 3v18M8 6v12M16 6v12M4 10v4M20 10v4" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">No audio yet</p>
                <p className="text-[var(--text-xs)] text-[var(--text-tertiary)]">
                  Choose a mode, describe what you want, generate.
                </p>
              </div>
            )}
          </Panel>

          <Panel className="p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[var(--text-xs)] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                Recent · {history.items.length}
              </span>
              {history.items.length > 0 && (
                <button onClick={history.clear} className="text-[var(--text-xs)] text-[var(--text-quaternary)] hover:text-[var(--danger)]">
                  Clear
                </button>
              )}
            </div>
            {history.items.length === 0 ? (
              <p className="py-6 text-center text-[var(--text-xs)] text-[var(--text-quaternary)]">No clips yet</p>
            ) : (
              <div className="space-y-2">
                {history.items.slice(0, 8).map((h) => (
                  <div key={h.id} className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-2">
                    <div className="mb-1.5 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--success)]" />
                      <p className="min-w-0 flex-1 truncate text-[var(--text-xs)] text-[var(--text-secondary)]">{h.prompt}</p>
                      {h.url && (
                        <button
                          onClick={() => download(h.url, h.prompt)}
                          className="text-[10px] text-[var(--text-tertiary)] transition hover:text-[var(--brand-300)]"
                          aria-label="Download"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        onClick={() => history.remove(h.id)}
                        className="text-[10px] text-[var(--text-quaternary)] hover:text-[var(--danger)]"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                    </div>
                    {h.url && <MediaPlayer src={h.url} kind="audio" compact />}
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </section>

        <aside>
          <Panel className="p-4">
            <Field label="Mode">
              <div className="flex gap-1 rounded-[var(--radius-md)] bg-[var(--surface-1)] p-1">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => m.enabled && setMode(m.id)}
                    disabled={!m.enabled}
                    title={m.note}
                    className={`flex-1 rounded-[var(--radius-sm)] py-1.5 text-[10.5px] font-medium transition ${
                      mode === m.id
                        ? 'bg-[var(--surface-4)] text-[var(--text-primary)]'
                        : m.enabled
                          ? 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                          : 'cursor-not-allowed text-[var(--text-quaternary)] opacity-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field
              label={mode === 'voiceover' || mode === 'voice-clone' ? 'Script' : 'Description'}
              className="mt-4"
              hint={`${prompt.length}/2000`}
            >
              <TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                maxLength={2000}
                placeholder={
                  mode === 'voiceover' || mode === 'voice-clone'
                    ? 'Welcome to Alveoly Studios, where your imagination becomes reality…'
                    : mode === 'music'
                      ? 'An epic orchestral theme with building tension…'
                      : 'Heavy rain on a tin roof with distant thunder…'
                }
              />
            </Field>

            {mode === 'voiceover' && (
              <Field label="Voice" className="mt-4">
                <div className="grid grid-cols-2 gap-1.5">
                  {VOICES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVoice(v.id)}
                      className={`rounded-[var(--radius-md)] border px-2.5 py-2 text-left transition ${
                        voice === v.id
                          ? 'border-[var(--brand-500)]/60 bg-[var(--brand-600)]/10'
                          : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                      }`}
                    >
                      <p className={`text-[var(--text-sm)] font-medium ${voice === v.id ? 'text-[var(--brand-300)]' : 'text-[var(--text-primary)]'}`}>
                        {v.label}
                      </p>
                      <p className="text-[10px] text-[var(--text-tertiary)]">{v.meta}</p>
                    </button>
                  ))}
                </div>
              </Field>
            )}

            {mode === 'voice-clone' && (
              <Field label="Voice sample" className="mt-4">
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    loading={uploadingSample}
                    className="w-full"
                  >
                    {cloneAudioUrl ? 'Change sample' : 'Upload sample (3–30s)'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleSampleUpload}
                    className="hidden"
                  />
                  {cloneAudioPreview && (
                    <div className="space-y-1.5">
                      <MediaPlayer src={cloneAudioPreview} kind="audio" compact />
                      <button
                        onClick={clearSample}
                        className="w-full text-center text-[10px] text-[var(--text-quaternary)] hover:text-[var(--danger)]"
                      >
                        Remove sample
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] leading-4 text-[var(--text-quaternary)]">
                    Clear, single-speaker recording with minimal background noise. 10–30s gives the best results.
                  </p>
                </div>
              </Field>
            )}

            {(mode === 'music' || mode === 'sfx') && (
              <>
                <Field label="Mood" className="mt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {MOODS.map((m) => (
                      <Chip key={m} active={mood === m} onClick={() => setMood(m)}>{m}</Chip>
                    ))}
                  </div>
                </Field>
                <div className="mt-4">
                  <Slider label="Length" value={length} min={5} max={60} step={5} onChange={setLength} formatValue={(v) => `${v}s`} />
                </div>
              </>
            )}

            {error && (
              <p className="mt-3 rounded-[var(--radius-md)] bg-[var(--danger)]/10 px-3 py-2 text-[var(--text-xs)] text-[var(--danger)]">
                {error}
              </p>
            )}

            <Button
              onClick={handleGenerate}
              loading={submitting}
              disabled={!prompt.trim() || (mode === 'voice-clone' && !cloneAudioUrl)}
              size="lg"
              className="mt-4 w-full"
            >
              {submitting
                ? 'Submitting…'
                : mode === 'voice-clone'
                  ? 'Clone & speak'
                  : 'Generate audio'}
            </Button>
            <p className="mt-2 text-center text-[10px] text-[var(--text-quaternary)]">
              Costs 1 credit · ~10s
            </p>

            {busy && (
              <div className="mt-4">
                <ProgressBar value={latest.progress || 0} tone="warning" />
              </div>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Waveform() {
  return (
    <div className="flex h-10 items-center gap-0.5">
      {Array.from({ length: 32 }).map((_, i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-[var(--brand-500)]"
          style={{
            height: `${8 + Math.abs(Math.sin(i * 0.6)) * 28}px`,
            animation: `pulse 0.9s ease-in-out ${i * 0.04}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}