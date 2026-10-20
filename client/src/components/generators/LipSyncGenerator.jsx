import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useHistory } from '../../hooks/useHistory';
import { Button, Field, Slider, ProgressBar, Panel, IconButton } from '../ui';
import MediaPlayer from '../studio/MediaPlayer';
import api from '../../api/axios';

const VIDEO_KEY = 'alveoly_lipsync_video';
const AUDIO_KEY = 'alveoly_lipsync_audio';

export default function LipSyncGenerator() {
  const { enqueue, jobs } = useQueue();
  const history = useHistory('lip-sync');

  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const [videoUrl, setVideoUrl] = useState(() => {
    try { return sessionStorage.getItem(VIDEO_KEY) || null; } catch { return null; }
  });
  const [videoPreview, setVideoPreview] = useState(() => {
    try { return sessionStorage.getItem(VIDEO_KEY) || null; } catch { return null; }
  });
  const [audioUrl, setAudioUrl] = useState(() => {
    try { return sessionStorage.getItem(AUDIO_KEY) || null; } catch { return null; }
  });
  const [audioPreview, setAudioPreview] = useState(() => {
    try { return sessionStorage.getItem(AUDIO_KEY) || null; } catch { return null; }
  });

  const [duration, setDuration] = useState(5);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const jobsForKind = jobs.filter((j) => j.kind === 'lip-sync');
  const latest = jobsForKind[0];
  const busy = latest && (latest.status === 'processing' || latest.status === 'queued');

  useEffect(() => {
    try {
      if (videoUrl) sessionStorage.setItem(VIDEO_KEY, videoUrl);
      if (audioUrl) sessionStorage.setItem(AUDIO_KEY, audioUrl);
    } catch { /* ignore */ }
  }, [videoUrl, audioUrl]);

  const handleVideoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setVideoPreview(localUrl);
    setUploadingVideo(true);
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
      setError(err.response?.data?.error || 'Video upload failed');
      setVideoPreview(null);
      setVideoUrl(null);
    } finally {
      setUploadingVideo(false);
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

  const handleGenerate = async () => {
    if (!videoUrl || !audioUrl || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const id = await enqueue({
        kind: 'lip-sync',
        prompt: 'Lip sync',
        payload: {
          videoUrl,
          audioUrl,
          endSeconds: duration,
        },
      });
      history.add({ id, url: null, prompt: 'Lip sync', source: videoUrl });
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
          history.add({ id: j.id, url: j.url, prompt: j.prompt, source: videoUrl });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobsForKind.map((j) => `${j.id}:${j.status}:${j.url ?? ''}`).join('|')]);

  const download = async (url, name = 'lip-sync') => {
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
    } catch { setError('Download failed'); }
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <header className="mb-6">
        <div className="mb-1 flex items-center gap-2 text-[var(--text-xs)] text-[var(--text-tertiary)]">
          <Link to="/dashboard" className="hover:text-[var(--text-primary)]">Home</Link>
          <span>/</span>
          <span className="text-[var(--text-secondary)]">Lip Sync</span>
        </div>
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">Lip Sync</h1>
        <p className="mt-0.5 text-[var(--text-sm)] text-[var(--text-tertiary)]">
          Make mouth movements match any audio track.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-4">
          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5">
              <div className="flex items-center gap-2 text-[var(--text-xs)] text-[var(--text-tertiary)]">
                <span className="font-medium text-[var(--text-secondary)]">Preview</span>
                {latest && (<><span>·</span><span className="font-mono">{latest.status}</span></>)}
              </div>
              {latest?.url && (
                <IconButton onClick={() => download(latest.url, latest.prompt)} title="Download">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 4v12m0 0 4-4m-4 4-4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </IconButton>
              )}
            </div>
            <div className="relative flex aspect-video w-full items-center justify-center bg-[var(--surface-1)]" onContextMenu={(e) => e.preventDefault()}>
              {latest?.url ? (
                <MediaPlayer src={latest.url} kind="video" />
              ) : busy ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-[var(--brand-500)]" />
                  <p className="text-[var(--text-sm)] font-medium">Syncing lips…</p>
                </div>
              ) : videoPreview ? (
                <video src={videoPreview} controls className="h-full w-full object-contain" onContextMenu={(e) => e.preventDefault()} disablePictureInPicture controlsList="nodownload noplaybackrate noremoteplayback" />
              ) : (
                <button onClick={() => videoInputRef.current?.click()} className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[var(--border-default)] px-10 py-14 transition hover:border-[var(--brand-500)]/40">
                  <p className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">Upload a video</p>
                  <p className="text-[var(--text-xs)] text-[var(--text-tertiary)]">Front-facing speaker, good lighting</p>
                </button>
              )}
              <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
            </div>
          </Panel>
        </section>

        <aside>
          <Panel className="p-4">
            <Button variant="secondary" onClick={() => videoInputRef.current?.click()} className="w-full" loading={uploadingVideo}>
              {videoUrl ? 'Change video' : 'Upload video'}
            </Button>
            <Button variant="secondary" onClick={() => audioInputRef.current?.click()} className="mt-2 w-full" loading={uploadingAudio}>
              {audioUrl ? 'Change audio' : 'Upload audio'}
            </Button>
            <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioSelect} className="hidden" />
            {audioPreview && <div className="mt-2"><MediaPlayer src={audioPreview} kind="audio" compact /></div>}

            <div className="mt-4">
              <Slider label="Duration" value={duration} min={2} max={30} step={1} onChange={setDuration} formatValue={(v) => `${v}s`} />
            </div>

            {error && <p className="mt-3 rounded-[var(--radius-md)] bg-[var(--danger)]/10 px-3 py-2 text-[var(--text-xs)] text-[var(--danger)]">{error}</p>}

            <Button onClick={handleGenerate} loading={submitting} disabled={!videoUrl || !audioUrl} size="lg" className="mt-4 w-full">
              {submitting ? 'Submitting…' : 'Sync lips'}
            </Button>
            <p className="mt-2 text-center text-[10px] text-[var(--text-quaternary)]">Costs ~{duration * 48} credits · ~90s</p>

            {busy && <div className="mt-4"><ProgressBar value={latest.progress || 0} /></div>}
          </Panel>
        </aside>
      </div>
    </div>
  );
}