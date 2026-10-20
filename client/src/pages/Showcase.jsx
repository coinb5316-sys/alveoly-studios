import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

/* ─────────────────────────────────────────────
   Showcase data — curated visuals with prompt
   captions to sell the "AI studio" story
   ───────────────────────────────────────────── */

const CATEGORIES = ['All', 'Portraits', 'Landscapes', 'Abstract', 'Motion'];

const SHOWCASE_ITEMS = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=85',
    alt: 'Abstract neon waves',
    prompt: 'Flowing neon waves, cinematic, 8K',
    category: 'Abstract',
    accent: '#ff6b6b',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=85',
    alt: 'Cosmic nebula',
    prompt: 'Deep space nebula, volumetric light',
    category: 'Landscapes',
    accent: '#8b5cf6',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=85',
    alt: 'Portrait with dramatic light',
    prompt: 'Studio portrait, rim lighting, 85mm',
    category: 'Portraits',
    accent: '#f59e0b',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=1200&q=85',
    alt: 'Geometric neon corridor',
    prompt: 'Futuristic corridor, neon geometry',
    category: 'Abstract',
    accent: '#10b981',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
    alt: 'Mountain range at dawn',
    prompt: 'Alpine peaks at sunrise, 4K film',
    category: 'Landscapes',
    accent: '#ec4899',
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
    alt: 'Product watch shot',
    prompt: 'Luxury watch macro, softbox lighting',
    category: 'Abstract',
    accent: '#f472b6',
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
    alt: 'Candid portrait',
    prompt: 'Natural portrait, golden hour, bokeh',
    category: 'Portraits',
    accent: '#fb923c',
  },
  {
    id: 8,
    src: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=85',
    alt: 'Sunset gradient',
    prompt: 'Desert sunset, warm gradient sky',
    category: 'Landscapes',
    accent: '#f43f5e',
  },
];

/* Motion previews — Coverr's AI-generated stock video is
   explicitly licensed for commercial use and clearly labeled
   as AI-generated [citation:4][citation:23].
   Swap these for your own generated clips when ready. */
const MOTION_ITEMS = [
  {
    id: 'm1',
    video: 'https://cdn.coverr.co/videos/coverr-abstract-ai-shapes-1584/1080p.mp4',
    poster: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=800&q=70',
    title: 'Fluid Abstraction',
    prompt: 'Liquid metal morphing, neon accents',
    accent: '#8b5cf6',
  },
  {
    id: 'm2',
    video: 'https://cdn.coverr.co/videos/coverr-ai-particle-field-1573/1080p.mp4',
    poster: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=70',
    title: 'Particle Drift',
    prompt: 'Slow particle field, deep space',
    accent: '#10b981',
  },
  {
    id: 'm3',
    video: 'https://cdn.coverr.co/videos/coverr-glowing-ai-lines-1590/1080p.mp4',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=70',
    title: 'Neon Trails',
    prompt: 'Glowing line art, synthwave loop',
    accent: '#ff6b6b',
  },
];

export default function Showcase() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightbox, setLightbox] = useState(null); // { src, alt, prompt } | null

  const filtered =
    activeCategory === 'All'
      ? SHOWCASE_ITEMS
      : SHOWCASE_ITEMS.filter((item) => item.category === activeCategory);

  // Close lightbox on Escape, navigate with arrows
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') {
        const idx = SHOWCASE_ITEMS.findIndex((i) => i.src === lightbox.src);
        const next = SHOWCASE_ITEMS[(idx + 1) % SHOWCASE_ITEMS.length];
        setLightbox({ src: next.src, alt: next.alt, prompt: next.prompt });
      }
      if (e.key === 'ArrowLeft') {
        const idx = SHOWCASE_ITEMS.findIndex((i) => i.src === lightbox.src);
        const prev = SHOWCASE_ITEMS[(idx - 1 + SHOWCASE_ITEMS.length) % SHOWCASE_ITEMS.length];
        setLightbox({ src: prev.src, alt: prev.alt, prompt: prev.prompt });
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox]);

  return (
    <main id="top" className="page-scroll min-h-screen overflow-x-hidden bg-[#fdfbf7] text-[#1a1a1a]">
      {/* Ambient glows — same palette as Landing/Features */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-[var(--coral)] opacity-[0.06] blur-[130px]" />
        <div className="absolute top-[40%] right-[10%] h-[420px] w-[420px] rounded-full bg-[var(--violet)] opacity-[0.05] blur-[130px]" />
      </div>

      <Navbar />

      <section className="mx-auto max-w-[1400px] px-5 pt-28 pb-24 sm:px-8 sm:pt-32">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-[11.5px] font-medium text-[#4a4a4a] backdrop-blur">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--coral)] animate-pulse" />
            Community Showcase
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[64px] lg:leading-[1.05]">
            Made with{' '}
            <span className="font-serif-human italic font-medium text-[var(--coral)]">
              Alveoly.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-[#6b6b6b] sm:text-base">
            A living gallery of visuals, portraits, and motion created by our community.
            Every piece starts with a prompt.
          </p>
        </div>

        {/* Category filters */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition ${
                activeCategory === cat
                  ? 'bg-[#1a1a1a] text-white'
                  : 'border border-black/10 bg-white text-[#4a4a4a] hover:border-black/20 hover:text-[#1a1a1a]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry gallery */}
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => setLightbox({ src: item.src, alt: item.alt, prompt: item.prompt })}
              className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-black/[0.06] bg-white text-left shadow-sm transition hover:shadow-xl"
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="w-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />

              {/* Hover overlay with prompt */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

              <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <span
                  className="mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ backgroundColor: `${item.accent}22`, color: item.accent }}
                >
                  {item.category}
                </span>
                <p className="text-[12px] font-medium leading-5 text-white/90">
                  “{item.prompt}”
                </p>
              </div>

              {/* Accent glow */}
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30"
                style={{ background: item.accent }}
              />
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-16 text-center text-[14px] text-[#6b6b6b]">
            Nothing in this category yet — check back soon.
          </p>
        )}

        {/* ─────────────────────────────────────
           MOTION SECTION
           ───────────────────────────────────── */}
        <div className="mt-24">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">In motion.</h2>
              <p className="mt-1 text-[14px] text-[#6b6b6b]">
                Cinematic loops generated with Alveoly Motion Studio.
              </p>
            </div>
            <div className="hidden h-px flex-1 bg-gradient-to-r from-black/10 to-transparent sm:ml-8 sm:block" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MOTION_ITEMS.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-black/[0.06] bg-black shadow-sm transition hover:shadow-xl"
              >
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  poster={item.poster}
                  className="aspect-video w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                  src={item.video}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ backgroundColor: `${item.accent}33`, color: item.accent }}
                    >
                      Motion
                    </span>
                  </div>
                  <h3 className="mt-2 text-[14px] font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-[11.5px] leading-5 text-white/70">“{item.prompt}”</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-center text-[11px] text-[#8a8a8a]">
            Motion previews are AI-generated stock clips. Swap them for your own Alveoly outputs when ready.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 overflow-hidden rounded-[36px] bg-[#1a1a1a] px-6 py-16 text-center text-white sm:px-12">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Your idea could be{' '}
            <span className="font-serif-human italic text-[var(--coral)]">next.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[14.5px] text-white/60">
            Join thousands of creators turning prompts into visuals.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[14px] font-semibold text-black transition hover:bg-gray-100 hover:-translate-y-0.5"
            >
              Start Creating Free <span>→</span>
            </a>
            <a
              href="/features"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-[14px] font-medium text-white backdrop-blur transition hover:bg-white/10"
            >
              Explore all tools
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {/* ─────────────────────────────────────
         LIGHTBOX
         ───────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button
            onClick={() => setLightbox(null)}
            aria-label="Close preview"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>

          <div
            className="relative max-h-[90vh] max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className="max-h-[85vh] w-auto rounded-2xl object-contain shadow-2xl"
            />
            <div className="mt-4 text-center">
              <p className="text-[13px] text-white/80">“{lightbox.prompt}”</p>
              <p className="mt-1 text-[11px] text-white/40">
                Use ← → to browse · Esc to close
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}