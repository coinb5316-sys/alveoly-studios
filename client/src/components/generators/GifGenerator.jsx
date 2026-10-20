import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useHistory } from '../../hooks/useHistory';
import { Button, Field, TextArea, ProgressBar, Panel, IconButton, Chip } from '../ui';
import api from '../../api/axios';

const FORMATS = [
  { id: 'gif',  label: 'GIF' },
  { id: 'mp4',  label: 'MP4' },
  { id: 'webm', label: 'WebM' },
];

export default function GifGenerator() {
  const { enqueue, jobs } = useQueue();
  const history = useHistory('gif');

  const [prompt, setPrompt] = useState('');
  const [format, setFormat] = useState('gif');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const jobsForKind = jobs.filter((j) => j.kind === 'gif');
  const latest = jobsForKind[0];
  const busy = latest && (latest.status === 'processing' || latest.status === 'queued');

  const handleGenerate = async () => {
    if (!prompt.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const id = await enqueue({
        kind: 'gif',
        prompt: prompt.trim(),
        payload: {
          prompt: prompt.trim(),
          outputFormat: format,
        },
      });
      history.add({ id, url: null, prompt: prompt.trim() });
      setPrompt('');
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
          history.add({ id: j.id, url: j.url, prompt: j.prompt });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobsForKind.map((j) => `${j.id}:${j.status}:${j.url ?? ''}`).join('|')]);

  const download = async (url, name = 'gif') => {
    if (!url) return;
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const slug = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'alveoly';
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `alveoly-${slug}.${format}`;
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
          <span className="text-[var(--text-secondary)]">GIFs</span>
        </div>
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">AI GIF Generator</h1>
        <p className="mt-0.5 text-[var(--text-sm)] text-[var(--text-tertiary)]">
          Create animated GIFs from a text prompt.
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
                  <p className="text-[var(--text-sm)] font-medium">Animating your GIF…</p>
                </div>
              ) : (
                <div className="flex max-w-xs flex-col items-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--text-quaternary)]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2.5" />
                      <path d="M7 11h3M7 14h3M15 11a2 2 0 1 1-2 2" />
                    </svg>
                  </div>
                  <p className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">
                    Your GIF will appear here
                  </p>
                  <p className="text-[var(--text-xs)] text-[var(--text-tertiary)]">
                    Describe an animated scene on the right.
                  </p>
                </div>
              )}
            </div>
          </Panel>
        </section>

        <aside>
          <Panel className="p-4">
            <Field label="Prompt" hint={`${prompt.length}/500`}>
              <TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="A cat typing on a keyboard, animated loop, cartoon style…"
              />
            </Field>

            <Field label="Output format" className="mt-4">
              <div className="flex flex-wrap gap-1.5">
                {FORMATS.map((f) => (
                  <Chip key={f.id} active={format === f.id} onClick={() => setFormat(f.id)}>
                    {f.label}
                  </Chip>
                ))}
              </div>
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
              disabled={!prompt.trim()}
              size="lg"
              className="mt-4 w-full"
            >
              {submitting ? 'Submitting…' : 'Generate GIF'}
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