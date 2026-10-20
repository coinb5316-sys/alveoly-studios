import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useHistory } from '../../hooks/useHistory';
import {
  Button, Field, TextArea, Select, Slider, ProgressBar, Panel, Chip, IconButton,
} from '../ui';
import MediaPlayer from '../studio/MediaPlayer';
import api from '../../api/axios';

const IMAGE_KEY = 'alveoly_talking_photo_image';
const AUDIO_KEY = 'alveoly_talking_photo_audio';

const VOICES = [
  { id: 'Morgan Freeman', label: 'Morgan Freeman', meta: 'M · US' },
  { id: 'Joe Rogan', label: 'Joe Rogan', meta: 'M · US' },
  { id: 'Donald Trump', label: 'Donald Trump', meta: 'M · US' },
  { id: 'Elon Musk', label: 'Elon Musk', meta: 'M · US' },
  { id: 'Barack Obama', label: 'Barack Obama', meta: 'M · US' },
];

const MODES = [
  { id: 'realistic', label: 'Realistic', note: 'Higher quality · 48 credits/sec' },
  { id: 'prompted', label: 'Prompted', note: 'Faster · 20 credits/sec' },
];

export default function TalkingPhotoGenerator() {
  const { enqueue, jobs } = useQueue();
  const history = useHistory('talking-photo');

  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // Sources
  const [imageUrl, setImageUrl] = useState(() => {
    try { return sessionStorage.getItem(IMAGE_KEY) || null; } catch { return null; }
  });
  const [imagePreview, setImagePreview] = useState(() => {
    try { return sessionStorage.getItem(IMAGE_KEY) || null; } catch { return null; }
  });
  const [audioUrl, setAudioUrl] = useState(() => {
    try { return sessionStorage.getItem(AUDIO_KEY) || null; } catch { return null; }
  });
  const [audioPreview, setAudioPreview] = useState(() => {
    try { return sessionStorage.getItem(AUDIO_KEY) || null; } catch { return null; }
  });

  // Audio source mode
  const [audioMode, setAudioMode] = useState('script'); // 'script' | 'upload'
  const [script, setScript] = useState('');
  const [voice, setVoice] = useState('Morgan Freeman');

  // Generation params
  const [mode, setMode] = useState('prompted');
  const [duration, setDuration] = useState(10);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const jobsForKind = jobs.filter((j) => j.kind === 'talking-photo');
  const latest = jobsForKind[0];
  const busy = latest && (latest.status === 'processing' || latest.status === 'queued');

  // Persist sources
  useEffect(() => {
    try {
      if (imageUrl) sessionStorage.setItem(IMAGE_KEY, imageUrl);
      if (audioUrl) sessionStorage.setItem(AUDIO_KEY, audioUrl);
    } catch { /* ignore */ }
  }, [imageUrl, audioUrl]);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    setUploadingImage(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(res.data.url);
    } catch (err) {
      setError(err.response?.data?.error || 'Image upload failed');
      setImagePreview(null);
      setImageUrl(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAudioSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setAudioPreview(localUrl);

    setUploadingAudio(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAudioUrl(res.data.url);
      URL.revokeObjectURL(localUrl);
      setAudioPreview(res.data.url);
    } catch (err) {
      setError(err.response?.data?.error || 'Audio upload failed');
      setAudioPreview(null);
      setAudioUrl(null);
    } finally {
      setUploadingAudio(false);
    }
  };

  // Handles the TTS → Talking Photo chain
  const handleGenerate = async () => {
    if (!imageUrl || submitting) return;
    if (audioMode === 'upload' && !audioUrl) {
      setError('Upload an audio file first');
      return;
    }
    if (audioMode === 'script' && !script.trim()) {
      setError('Enter a script first');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (audioMode === 'upload') {
        // Direct path — one queue job
        const id = await enqueue({
          kind: 'talking-photo',
          prompt: 'Talking photo',
          payload: {
            imageUrl,
            audioUrl,
            endSeconds: duration,
            generationMode: mode,
            sourceUrl: imageUrl,
          },
        });
        history.add({
          id,
          url: null,
          prompt: 'Talking photo',
          source: imageUrl,
        });
      } else {
        // TTS path — two-step
        const startRes = await api.post('/generate/talking-photo', {
          imageUrl,
          script: script.trim(),
          voice,
          endSeconds: duration,
          generationMode: mode,
        });
        const ttsProjectId = startRes.data.projectId;

        // Poll TTS until the audio file is ready
        const ttsUrl = await pollTts(ttsProjectId);

        // Kick off the actual talking photo job
        const continueRes = await api.post('/generate/talking-photo/continue', {
          imageUrl,
          audioUrl: ttsUrl,
          endSeconds: duration,
          generationMode: mode,
        });
        const finalProjectId = continueRes.data.projectId;

        // Enqueue for polling WITHOUT re-POSTing
        await enqueue({
          kind: 'talking-photo',
          prompt: script.trim().slice(0, 100),
          payload: {
            sourceUrl: imageUrl,
            duration,
          },
          existingProjectId: finalProjectId,
        });
        history.add({
          id: finalProjectId,
          url: null,
          prompt: script.trim().slice(0, 100),
          source: imageUrl,
        });
      }
      setScript('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Generation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Poll the audio endpoint until the MP3 is ready
  const pollTts = async (projectId) => {
    for (let i = 0; i < 60; i += 1) {
      const { data } = await api.get(`/generate/audio/${projectId}`);
      if (data.status === 'completed' && data.url) return data.url;
      if (data.status === 'failed') {
        throw new Error(data.error || 'Text-to-speech failed');
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    throw new Error('TTS timed out');
  };

  // Sync completed jobs → history
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
  const download = async (url, name = 'talking-photo') => {
    if (!url) return;
    try {
      const res = await fetch(url, { mode: 'cors' });
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
      setError('Download failed');
    }
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <header className="mb-6">
        <div className="mb-1 flex items-center gap-2 text-[var(--text-xs)] text-[var(--text-tertiary)]">
          <Link to="/dashboard" className="hover:text-[var(--text-primary)]">Home</Link>
          <span>/</span>
          <span className="text-[var(--text-secondary)]">Talking Photo</span>
        </div>
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">Talking Photo</h1>
        <p className="mt-0.5 text-[var(--text-sm)] text-[var(--text-tertiary)]">
          Bring any portrait to life with generated or uploaded audio.
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
              className="relative flex aspect-[9/16] max-h-[520px] w-full items-center justify-center bg-[var(--surface-1)]"
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
                  <p className="text-[var(--text-sm)] font-medium">Generating talking photo…</p>
                </div>
              ) : imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Source"
                  draggable={false}
                  className="h-full w-full object-contain"
                  onContextMenu={(e) => e.preventDefault()}
                />
              ) : (
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[var(--border-default)] px-10 py-14 transition hover:border-[var(--brand-500)]/40"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--text-quaternary)]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                  <p className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">Upload a portrait</p>
                  <p className="text-[var(--text-xs)] text-[var(--text-tertiary)]">Front-facing, single subject, good lighting</p>
                </button>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </Panel>
        </section>

        <aside className="space-y-4">
          <Panel className="p-4">
            <Button
              variant="secondary"
              onClick={() => imageInputRef.current?.click()}
              className="w-full"
              loading={uploadingImage}
            >
              {imageUrl ? 'Change portrait' : 'Upload portrait'}
            </Button>

            <Field label="Audio source" className="mt-4">
              <div className="flex gap-1 rounded-[var(--radius-md)] bg-[var(--surface-1)] p-1">
                {[
                  { id: 'script', label: 'Generate voice' },
                  { id: 'upload', label: 'Upload audio' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setAudioMode(opt.id)}
                    className={`flex-1 rounded-[var(--radius-sm)] py-1.5 text-[11px] font-medium transition ${
                      audioMode === opt.id
                        ? 'bg-[var(--surface-4)] text-[var(--text-primary)]'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>

            {audioMode === 'script' && (
              <>
                <Field label="Script" className="mt-3" hint={`${script.length}/2000`}>
                  <TextArea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    rows={4}
                    maxLength={2000}
                    placeholder="Welcome to Alveoly Studios — where your imagination becomes reality…"
                  />
                </Field>
                <Field label="Voice" className="mt-3">
                  <Select value={voice} onChange={(e) => setVoice(e.target.value)}>
                    {VOICES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                  </Select>
                </Field>
              </>
            )}

            {audioMode === 'upload' && (
              <Field label="Audio file" className="mt-3">
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    onClick={() => audioInputRef.current?.click()}
                    className="w-full"
                    loading={uploadingAudio}
                  >
                    {audioUrl ? 'Change audio' : 'Upload audio (MP3 / WAV)'}
                  </Button>
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioSelect}
                    className="hidden"
                  />
                  {audioPreview && <MediaPlayer src={audioPreview} kind="audio" compact />}
                </div>
              </Field>
            )}

            <Field label="Generation mode" className="mt-4">
              <div className="flex flex-wrap gap-1.5">
                {MODES.map((m) => (
                  <Chip key={m.id} active={mode === m.id} onClick={() => setMode(m.id)}>
                    {m.label}
                  </Chip>
                ))}
              </div>
            </Field>

            <div className="mt-4">
              <Slider
                label="Duration"
                value={duration}
                min={5}
                max={30}
                step={1}
                onChange={setDuration}
                formatValue={(v) => `${v}s`}
              />
            </div>

            <p className="mt-2 text-[10px] leading-4 text-[var(--text-quaternary)]">
              {mode === 'realistic'
                ? `${duration * 48} credits estimated (realistic mode)`
                : `${duration * 20} credits estimated (prompted mode)`}
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
                (audioMode === 'upload' && !audioUrl) ||
                (audioMode === 'script' && !script.trim())
              }
              size="lg"
              className="mt-4 w-full"
            >
              {submitting ? 'Submitting…' : 'Generate talking photo'}
            </Button>

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