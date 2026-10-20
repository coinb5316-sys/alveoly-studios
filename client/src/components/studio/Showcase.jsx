import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════
   HERO "SCENES"
   Instead of external videos (which break), each scene is a
   pure-CSS animated gradient that evokes a cinematic mood.
   Add your own Cloudinary MP4 URLs to `video` once you have
   real generations — the component will use video if present,
   otherwise fall back to the gradient.
   ═══════════════════════════════════════════════════════════ */
const SCENES = [
  {
    id: 'aurora',
    prompt: 'Aurora over a midnight mountain lake',
    tag: 'Text → Video',
    gradient:
      'radial-gradient(at 20% 30%, #7c3aed 0%, transparent 50%), radial-gradient(at 80% 20%, #06b6d4 0%, transparent 45%), radial-gradient(at 50% 80%, #ec4899 0%, transparent 55%), #050507',
    video: null, // set to a Cloudinary MP4 when ready
  },
  {
    id: 'ember',
    prompt: 'Embers rising over a dark industrial skyline',
    tag: 'Text → Image',
    gradient:
      'radial-gradient(at 15% 40%, #f97316 0%, transparent 50%), radial-gradient(at 75% 25%, #dc2626 0%, transparent 45%), radial-gradient(at 55% 85%, #7c2d12 0%, transparent 60%), #050507',
    video: null,
  },
  {
    id: 'nebula',
    prompt: 'Deep-space nebula with a slow orbital camera',
    tag: 'Text → Video',
    gradient:
      'radial-gradient(at 25% 30%, #2563eb 0%, transparent 50%), radial-gradient(at 80% 40%, #a855f7 0%, transparent 50%), radial-gradient(at 50% 90%, #ec4899 0%, transparent 60%), #050507',
    video: null,
  },
];

const GALLERY = [
  { src: 'https://images.unsplash.com/photo-1684369175809-f9642140a1bd?auto=format&fit=crop&w=600&q=80', tag: 'Image', prompt: 'Neon city, cinematic', span: 'row-span-2' },
  { src: 'https://images.unsplash.com/photo-1686191128892-3b37add4c844?auto=format&fit=crop&w=600&q=80', tag: 'Video', prompt: 'Waves at golden hour', span: '' },
  { src: 'https://images.unsplash.com/photo-1633621412960-6df85eff8c85?auto=format&fit=crop&w=600&q=80', tag: 'Image', prompt: 'Portrait, 85mm', span: '' },
  { src: 'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?auto=format&fit=crop&w=600&q=80', tag: 'Image', prompt: 'Abstract motion', span: 'row-span-2' },
  { src: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?auto=format&fit=crop&w=600&q=80', tag: 'Audio', prompt: 'Cinematic score', span: '' },
  { src: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80', tag: 'Image', prompt: 'Sci-fi landscape', span: '' },
  { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', tag: 'Video', prompt: 'Orbit around planet', span: '' },
  { src: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=80', tag: 'Image', prompt: 'Surreal portrait', span: '' },
];

const STATS = [
  { value: '10M+', label: 'Generations' },
  { value: '4K', label: 'Max resolution' },
  { value: '~30s', label: 'Avg render' },
  { value: '99.9%', label: 'Uptime' },
];

function StatValue({ value }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <span
      className={`inline-block transition-all duration-700 ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      {value}
    </span>
  );
}

export default function Showcase() {
  const [slide, setSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const videoRefs = useRef([]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SCENES.length), 7000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === slide) v.play().catch(() => {});
      else { v.pause(); v.currentTime = 0; }
    });
  }, [slide]);

  const scene = SCENES[slide];

  return (
    <div className="pb-16">
      <style>{`
        @keyframes scenegrid {
          0%   { background-position: 0 0, 0 0; }
          100% { background-position: 48px 48px, 48px 48px; }
        }
        @keyframes sceneglow {
          0%, 100% { opacity: .55; }
          50%      { opacity: .85; }
        }
      `}</style>

      {/* ═══════════════ HERO ═══════════════ */}
      <section
        className={`relative mb-10 overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-black transition-all duration-700 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="relative aspect-[16/8] max-h-[560px] min-h-[420px] w-full overflow-hidden">
          {/* Scene layers — either gradient or optional video */}
          {SCENES.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-[1400ms] ${
                i === slide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {s.video ? (
                <video
                  ref={(el) => (videoRefs.current[i] = el)}
                  src={s.video}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    background: s.gradient,
                    animation: i === slide ? 'sceneglow 8s ease-in-out infinite' : 'none',
                  }}
                />
              )}
            </div>
          ))}

          {/* Subtle animated grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              animation: 'scenegrid 20s linear infinite',
            }}
          />

          {/* Cinematic vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,.55))]" />

          {/* Copy */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-12">
            <div className="max-w-2xl">
              <div
                className={`mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[10.5px] font-medium text-white/85 backdrop-blur-md transition-all duration-700 delay-100 ${
                  mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                }`}
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--success)]" />
                {scene.tag} · Powered by state-of-the-art models
              </div>

              <h1
                className={`text-[32px] font-bold leading-[1.05] tracking-[-0.02em] text-white sm:text-[44px] lg:text-[52px] transition-all duration-700 delay-200 ${
                  mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
              >
                Create <span className="bg-gradient-to-r from-[var(--brand-300)] via-[#f0abfc] to-[var(--brand-300)] bg-clip-text text-transparent">anything</span>
                <br />
                you can imagine.
              </h1>

              <p
                className={`mt-3 max-w-lg text-[13.5px] leading-6 text-white/65 sm:text-[14.5px] transition-all duration-700 delay-300 ${
                  mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
              >
                {scene.prompt} — describe it, generate it, ship it. Image, video, and audio in one studio.
              </p>

              <div
                className={`mt-6 flex flex-wrap items-center gap-2.5 transition-all duration-700 delay-400 ${
                  mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
              >
                <Link
                  to="/dashboard/image"
                  className="group inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-[13px] font-semibold text-black shadow-[0_8px_32px_-8px_rgba(255,255,255,.4)] transition hover:bg-white/90"
                >
                  Start creating
                  <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  to="/dashboard/video"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/[0.08] px-5 text-[13px] font-medium text-white backdrop-blur-md transition hover:bg-white/[0.14]"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch demo
                </Link>
              </div>
            </div>
          </div>

          {/* Slide indicators */}
          <div className="absolute right-5 top-5 flex gap-1.5">
            {SCENES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === slide ? 'w-8 bg-white' : 'w-2 bg-white/35 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-[var(--border-default)] bg-white/[0.02] p-4 backdrop-blur-xl transition hover:border-[var(--border-strong)] hover:bg-white/[0.04]"
          >
            <p className="text-[22px] font-bold tracking-tight text-white sm:text-[24px]">
              <StatValue value={s.value} />
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
              {s.label}
            </p>
          </div>
        ))}
      </section>

      {/* ═══════════════ CAPABILITIES ═══════════════ */}
      <section className="mb-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-[20px] font-semibold tracking-tight text-white">
              Three studios. One workspace.
            </h2>
            <p className="mt-1 text-[12.5px] text-[var(--text-tertiary)]">
              Pick your medium — the model does the rest.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <CapCard
            to="/dashboard/image"
            title="Image"
            desc="Photoreal, cinematic, anime, 3D. 6 presets, 5 ratios."
            accent="var(--brand-400)"
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="9" cy="9" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            }
          />
          <CapCard
            to="/dashboard/video"
            title="Video"
            desc="Text-to-video with 6 camera motions, up to 4K."
            accent="var(--success)"
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="2" y="5" width="15" height="14" rx="2.5" />
                <path d="m17 9 5-3v12l-5-3V9Z" />
              </svg>
            }
          />
          <CapCard
            to="/dashboard/audio"
            title="Audio"
            desc="5 voices, 8 moods, sound FX. MP3 download."
            accent="var(--warning)"
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <path d="M12 3v18M8 6v12M16 6v12M4 10v4M20 10v4" />
              </svg>
            }
          />
        </div>
      </section>

      {/* ═══════════════ GALLERY ═══════════════ */}
      <section className="mb-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-[20px] font-semibold tracking-tight text-white">
              Made with Alveoly
            </h2>
            <p className="mt-1 text-[12.5px] text-[var(--text-tertiary)]">
              A glimpse of what creators ship every day.
            </p>
          </div>
          <Link
            to="/dashboard/image"
            className="hidden text-[12px] font-medium text-[var(--brand-300)] transition hover:text-[var(--brand-200)] sm:block"
          >
            Generate yours →
          </Link>
        </div>

        <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:grid-cols-4">
          {GALLERY.map((g, i) => (
            <div
              key={i}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--border-default)] bg-black/40 transition-all duration-500 hover:border-[var(--border-strong)] hover:shadow-[0_20px_60px_-20px_rgba(139,92,246,.35)] ${g.span}`}
            >
              <img
                src={g.src}
                alt={g.prompt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition group-hover:opacity-90" />
              <div className="absolute inset-x-0 bottom-0 translate-y-1 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white backdrop-blur">
                  {g.tag}
                </span>
                <p className="mt-1.5 line-clamp-1 text-[11px] font-medium text-white/90">
                  {g.prompt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border-default)] bg-gradient-to-br from-[var(--brand-600)]/20 via-[var(--brand-500)]/10 to-[#ec4899]/20 p-8 sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[var(--brand-400)] opacity-30 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#ec4899] opacity-20 blur-[100px]" />
        <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-[24px] font-bold tracking-tight text-white sm:text-[30px]">
              Your next idea is one prompt away.
            </h2>
            <p className="mt-1.5 text-[13px] text-white/60">
              No credit card. Start free — upgrade only when you scale.
            </p>
          </div>
          <Link
            to="/dashboard/image"
            className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-white px-5 text-[13px] font-semibold text-black shadow-[0_8px_32px_-8px_rgba(255,255,255,.4)] transition hover:bg-white/90"
          >
            Open Image Studio
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}

function CapCard({ to, title, desc, accent, icon }) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-white/[0.02] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-white/[0.04]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at top right, ${accent}22, transparent 60%)` }}
      />
      <div className="relative">
        <div
          className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
            boxShadow: `0 8px 24px -6px ${accent}66`,
          }}
        >
          {icon}
        </div>
        <h3 className="text-[14px] font-semibold text-white">{title}</h3>
        <p className="mt-1.5 text-[12px] leading-5 text-[var(--text-tertiary)]">{desc}</p>
        <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-[var(--text-tertiary)] transition group-hover:text-white/80">
          Open studio
          <svg viewBox="0 0 24 24" className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  );
}