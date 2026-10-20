import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../../context/QueueContext';
import { useHistory } from '../../hooks/useHistory';
import {
  Button, IconButton, Chip, Field, TextArea, Select,
  Slider, ProgressBar, Panel,
} from '../ui';

const RATIOS = [
  { id: '1:1',  label: '1:1',  w: 32, h: 32 },
  { id: '16:9', label: '16:9', w: 44, h: 25 },
  { id: '9:16', label: '9:16', w: 25, h: 44 },
  { id: '4:3',  label: '4:3',  w: 40, h: 30 },
  { id: '3:4',  label: '3:4',  w: 30, h: 40 },
];

const PRESETS = [
  { id: 'cinematic',   label: 'Cinematic',   style: 'cinematic',      suffix: 'cinematic lighting, 35mm film, shallow depth of field' },
  { id: 'portrait',    label: 'Portrait',    style: 'photorealistic', suffix: '85mm portrait, bokeh, natural skin texture' },
  { id: 'anime',       label: 'Anime',       style: 'anime',          suffix: 'anime illustration, cel shaded, vibrant colors' },
  { id: '3d',          label: '3D Render',   style: '3d-render',      suffix: 'octane render, subsurface scattering, ray tracing' },
  { id: 'illustration',label: 'Illustration',style: 'illustration',   suffix: 'digital illustration, editorial, flat colors' },
  { id: 'cyberpunk',   label: 'Cyberpunk',   style: 'cyberpunk',      suffix: 'neon, volumetric fog, cyberpunk aesthetic' },
];

const MODELS = [
  { id: 'flux-schnell', label: 'Flux Schnell · fast' },
  { id: 'flux-pro',     label: 'Flux Pro · best quality' },
  { id: 'sdxl',         label: 'SDXL · balanced' },
];

export default function ImageGenerator() {
  const { enqueue, jobs } = useQueue();
  const history = useHistory('image');

  const [prompt, setPrompt] = useState('');
  const [preset, setPreset] = useState('cinematic');
  const [ratio, setRatio] = useState('1:1');
  const [model, setModel] = useState('flux-schnell');
  const [count, setCount] = useState(1);
  const [guidance, setGuidance] = useState(7);
  const [seed, setSeed] = useState('');
  const [negative, setNegative] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const promptRef = useRef(null);

  const currentPreset = PRESETS.find((p) => p.id === preset);
  const finalPrompt = useMemo(() => {
    if (!prompt.trim()) return '';
    return currentPreset?.suffix ? `${prompt.trim()}, ${currentPreset.suffix}` : prompt.trim();
  }, [prompt, currentPreset]);

  const imageJobs = jobs.filter((j) => j.kind === 'image');
  const latest = imageJobs[0];
  const aspect = RATIOS.find((r) => r.id === ratio);

  const handleGenerate = async () => {
    if (!prompt.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const projectId = await enqueue({
        kind: 'image',
        prompt: finalPrompt,
        payload: {
          prompt: finalPrompt,
          negativePrompt: negative.trim() || undefined,
          aspectRatio: ratio,
          style: currentPreset?.style || 'photorealistic',
          model,
          count,
          guidance,
          seed: seed.trim() ? Number(seed) : undefined,
        },
      });
      history.add({ id: projectId, url: null, prompt: finalPrompt, ratio, style: currentPreset?.style });
      setPrompt('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Generation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Sync completed jobs → history (useEffect, not useMemo)
  useEffect(() => {
    imageJobs.forEach((j) => {
      if (j.status === 'done' && j.url) {
        const existing = history.items.find((h) => h.id === j.id);
        if (existing && !existing.url) {
          history.remove(j.id);
          history.add({ id: j.id, url: j.url, prompt: j.prompt, ratio, style: currentPreset?.style });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageJobs.map((j) => `${j.id}:${j.status}:${j.url ?? ''}`).join('|')]);

  // Blob-based download — hides the Cloudinary URL from the browser
  const download = async (url, name = 'image') => {
    if (!url) return;
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
      a.download = `alveoly-${slug}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    } catch {
      setError('Download failed. Try again.');
    }
  };

  const busy = latest && (latest.status === 'processing' || latest.status === 'queued');

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Header */}
      <header className="mb-6 flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[var(--text-xs)] text-[var(--text-tertiary)]">
            <Link to="/dashboard" className="hover:text-[var(--text-primary)]">Home</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Image Studio</span>
          </div>
          <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">Image Studio</h1>
          <p className="mt-0.5 text-[var(--text-sm)] text-[var(--text-tertiary)]">
            Generate production-ready imagery from a prompt.
          </p>
        </div>
        <Button
          variant="secondary"
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 3v18M3 12h18" strokeLinecap="round"/>
            </svg>
          }
        >
          New
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ============ LEFT: Workspace (preview) ============ */}
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
                <div className="flex items-center gap-1">
                  <IconButton onClick={() => download(latest.url, latest.prompt)} title="Download">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 4v12m0 0 4-4m-4 4-4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </IconButton>
                </div>
              )}
            </div>

            <div
              className="relative flex w-full items-center justify-center bg-[var(--surface-1)]"
              style={{ aspectRatio: ratio.replace(':', '/') }}
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
                  <div className="text-center">
                    <p className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                      Generating…
                    </p>
                    <p className="mt-1 max-w-[240px] truncate text-[var(--text-xs)] text-[var(--text-tertiary)]">
                      {latest.prompt}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex max-w-xs flex-col items-center gap-3 px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--text-quaternary)]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="3"/>
                      <circle cx="9" cy="9" r="1.5"/>
                      <path d="m21 15-5-5L5 21"/>
                    </svg>
                  </div>
                  <p className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">
                    Nothing generated yet
                  </p>
                  <p className="text-[var(--text-xs)] text-[var(--text-tertiary)]">
                    Describe an image on the right to get started.
                  </p>
                </div>
              )}
            </div>
          </Panel>

          {/* History strip */}
          <Panel className="p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[var(--text-xs)] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                Recent · {history.items.length}
              </span>
              {history.items.length > 0 && (
                <button
                  onClick={history.clear}
                  className="text-[var(--text-xs)] text-[var(--text-quaternary)] hover:text-[var(--danger)]"
                >
                  Clear
                </button>
              )}
            </div>
            {history.items.length === 0 ? (
              <p className="py-6 text-center text-[var(--text-xs)] text-[var(--text-quaternary)]">
                Your generations will appear here
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                {history.items.slice(0, 16).map((h) => (
                  <div
                    key={h.id}
                    className="group relative aspect-square overflow-hidden rounded-[var(--radius-md)] bg-[var(--surface-3)]"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    {h.url ? (
                      <img
                        src={h.url}
                        alt=""
                        draggable={false}
                        className="h-full w-full object-cover"
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[var(--text-quaternary)]">
                        <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                      <button
                        onClick={() => download(h.url, h.prompt)}
                        className="text-[10px] text-white/80 hover:text-white"
                        aria-label="Download"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => history.remove(h.id)}
                        className="text-[10px] text-white/50 hover:text-[var(--danger)]"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </section>

        {/* ============ RIGHT: Control panel ============ */}
        <aside className="space-y-4">
          <Panel className="p-4">
            <Field label="Prompt" hint={`${prompt.length}/2000`}>
              <TextArea
                ref={promptRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                maxLength={2000}
                placeholder="A weathered lighthouse on a cliff at dusk, storm clouds, cinematic lighting…"
              />
            </Field>

            <Field label="Style preset" className="mt-4">
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <Chip key={p.id} active={preset === p.id} onClick={() => setPreset(p.id)}>
                    {p.label}
                  </Chip>
                ))}
              </div>
            </Field>

            <Field label="Aspect ratio" className="mt-4">
              <div className="grid grid-cols-5 gap-1.5">
                {RATIOS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRatio(r.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] border py-2 text-[10px] transition ${
                      ratio === r.id
                        ? 'border-[var(--brand-500)]/60 bg-[var(--brand-600)]/10 text-[var(--brand-300)]'
                        : 'border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:border-[var(--border-default)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    <span
                      className="rounded-sm border border-current opacity-60"
                      style={{ width: r.w, height: r.h }}
                    />
                    <span className="font-mono">{r.label}</span>
                  </button>
                ))}
              </div>
              {aspect && (
                <p className="mt-1.5 text-[10px] text-[var(--text-quaternary)]">
                  Output · {aspect.w * 32}×{aspect.h * 32}
                </p>
              )}
            </Field>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Field label="Model">
                <Select value={model} onChange={(e) => setModel(e.target.value)}>
                  {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </Select>
              </Field>
              <Field label="Images">
                <Select value={count} onChange={(e) => setCount(Number(e.target.value))}>
                  {[1, 2, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                </Select>
              </Field>
            </div>

            <Slider
              label="Guidance"
              value={guidance}
              min={1}
              max={20}
              step={0.5}
              onChange={setGuidance}
              formatValue={(v) => v.toFixed(1)}
            />

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setDrawerOpen((v) => !v)}
                className="flex items-center gap-1.5 text-[var(--text-xs)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              >
                Advanced
                <svg viewBox="0 0 24 24" className={`h-3 w-3 transition-transform ${drawerOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
            </div>

            {drawerOpen && (
              <div className="mt-3 space-y-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-1)] p-3">
                <Field label="Negative prompt">
                  <TextArea
                    value={negative}
                    onChange={(e) => setNegative(e.target.value)}
                    rows={2}
                    placeholder="blurry, watermark, low quality…"
                  />
                </Field>
                <Field label="Seed" hint="blank = random">
                  <input
                    type="text"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value.replace(/\D/g, ''))}
                    placeholder="auto"
                    className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 font-mono text-[var(--text-sm)] text-[var(--text-primary)] focus:border-[var(--brand-500)]/50 focus:outline-none"
                  />
                </Field>
              </div>
            )}

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
              {submitting ? 'Submitting…' : 'Generate'}
            </Button>
            <p className="mt-2 text-center text-[10px] text-[var(--text-quaternary)]">
              Costs 1 credit · ~15s
            </p>

            {busy && (
              <div className="mt-4 space-y-1.5">
                <ProgressBar value={latest.progress || 0} />
                <p className="text-center text-[10px] text-[var(--text-tertiary)]">
                  {latest.progress ? `${Math.round(latest.progress)}%` : 'Working…'}
                </p>
              </div>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}