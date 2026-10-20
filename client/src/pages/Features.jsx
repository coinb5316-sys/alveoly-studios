import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

/* ─────────────────────────────────────────────
   Tool groups — each tool gets its own icon
   and its own accent color from the shared palette
   ───────────────────────────────────────────── */

// Icon components (inline SVGs — no extra deps)
const Icons = {
  image: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  brush: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
      <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
    </svg>
  ),
  scissors: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
    </svg>
  ),
  sparkles: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3l1.9 5.7L20 10l-5.7 1.9L12 18l-1.9-5.7L4 10l5.7-1.9L12 3z" />
      <path d="M19 15l.9 2.6L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
    </svg>
  ),
  user: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </svg>
  ),
  palette: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="8" cy="10" r="1" />
      <circle cx="16" cy="10" r="1" />
      <circle cx="10" cy="16" r="1" />
    </svg>
  ),
  film: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M3 15h18M9 4v16M15 4v16" />
    </svg>
  ),
  play: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
    </svg>
  ),
  shuffle: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  ),
  mic: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  ),
  wave: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 12h2" />
    </svg>
  ),
  captions: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 14h4M13 14h4M7 10h4M13 10h4" />
    </svg>
  ),
  globe: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z" />
    </svg>
  ),
  gif: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M8 12h2M9 10v4M13 10v4M13 12h2M18 10v4" />
    </svg>
  ),
  wand: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M15 4V2M15 10V8M11 6H9M21 6h-2M17.5 8.5L19 7M17.5 3.5L19 5M4 20l9-9M14 15l1 1M18 19l2 2M18 15l2-2" />
    </svg>
  ),
  lipsync: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 4a4 4 0 0 0-4 4v4a4 4 0 0 0 8 0V8a4 4 0 0 0-4-4z" />
      <path d="M5 11v1a7 7 0 0 0 14 0v-1M8 20h8" />
    </svg>
  ),
  faceswap: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="8" cy="10" r="3" />
      <circle cx="16" cy="14" r="3" />
      <path d="M4 20c1.5-2 4-3 6-3M14 7c1.5-1 4-1 6 0" />
    </svg>
  ),
};

const TOOL_GROUPS = [
  {
    category: 'Visual Studio',
    description: 'Generate, edit, and enhance stunning imagery.',
    tools: [
      { title: 'AI Image Generator', desc: 'Create stunning visuals from a text prompt using Flux and SDXL models.', icon: 'image', accent: '#ff6b6b' },
      { title: 'AI Image Editor', desc: 'Edit, enhance, and transform any image with simple text instructions.', icon: 'brush', accent: '#8b5cf6' },
      { title: 'Background Remover', desc: 'Isolate subjects from any image with precision edge detection.', icon: 'scissors', accent: '#10b981' },
      { title: 'Image Upscaler', desc: 'Enhance resolution up to 4x with detail-preserving modes.', icon: 'sparkles', accent: '#f59e0b' },
      { title: 'Headshot Generator', desc: 'Turn a selfie into a professional headshot in seconds.', icon: 'user', accent: '#ec4899' },
      { title: 'Photo Colorizer', desc: 'Bring black and white photos to life with realistic color.', icon: 'palette', accent: '#f472b6' },
    ],
  },
  {
    category: 'Motion Studio',
    description: 'Bring your ideas to life with cinematic motion.',
    tools: [
      { title: 'Text to Video', desc: 'Turn a simple idea into a cinematic moving scene with camera controls.', icon: 'film', accent: '#10b981' },
      { title: 'Image to Video', desc: 'Animate any still image with a motion prompt and camera effects.', icon: 'play', accent: '#8b5cf6' },
      { title: 'Video to Video', desc: 'Restyle existing footage with a new art direction and style.', icon: 'shuffle', accent: '#ff6b6b' },
      { title: 'Talking Photo', desc: 'Bring portraits to life with expressive speech and motion.', icon: 'user', accent: '#f59e0b' },
      { title: 'Lip Sync', desc: 'Make mouth movements match any audio track perfectly.', icon: 'lipsync', accent: '#f472b6' },
      { title: 'Face Swap', desc: 'Replace a face in any photo with another in seconds.', icon: 'faceswap', accent: '#f43f5e' },
    ],
  },
  {
    category: 'Audio & Utility',
    description: 'Perfect your audio and add professional finishing touches.',
    tools: [
      { title: 'Voiceover', desc: 'Generate high-quality AI voiceovers with celebrity voices.', icon: 'mic', accent: '#f59e0b' },
      { title: 'Voice Cloning', desc: 'Clone any voice and generate speech in that voice.', icon: 'wave', accent: '#8b5cf6' },
      { title: 'Auto Subtitles', desc: 'Add accurate, styled subtitles to any video automatically.', icon: 'captions', accent: '#10b981' },
      { title: 'Video Translator', desc: 'Translate spoken audio into another language while preserving lip motion.', icon: 'globe', accent: '#0ea5e9' },
      { title: 'GIF Generator', desc: 'Create animated GIFs from a text prompt.', icon: 'gif', accent: '#fb923c' },
      { title: 'Animation', desc: 'Turn any image into a stylized animated clip.', icon: 'wand', accent: '#ff6b6b' },
    ],
  },
];

export default function Features() {
  return (
    <main id="top" className="page-scroll relative min-h-screen overflow-x-hidden bg-[#fdfbf7] text-[#1a1a1a]">
      {/* Ambient glows — same palette as Landing */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] left-[15%] h-[520px] w-[520px] rounded-full bg-[var(--coral)] opacity-[0.07] blur-[130px]" />
        <div className="absolute top-[35%] right-[8%] h-[420px] w-[420px] rounded-full bg-[var(--violet)] opacity-[0.06] blur-[130px]" />
        <div className="absolute bottom-[10%] left-[30%] h-[380px] w-[380px] rounded-full bg-[var(--amber)] opacity-[0.05] blur-[130px]" />
      </div>

      <Navbar />

      <section className="mx-auto max-w-[1200px] px-5 pt-28 pb-24 sm:px-8 sm:pt-32">
        {/* Header */}
        <div className="mb-20 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-[11.5px] font-medium text-[#4a4a4a] backdrop-blur">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--coral)] animate-pulse" />
            18 Professional Tools
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[64px] lg:leading-[1.05]">
            One studio.{' '}
            <span className="font-serif-human italic font-medium text-[var(--coral)]">
              Every possibility.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-7 text-[#6b6b6b] sm:text-base">
            Alveoly Studios combines the world's best generative AI models into one
            seamless, professional-grade creative platform.
          </p>
        </div>

        {/* Tool Groups */}
        <div className="space-y-20">
          {TOOL_GROUPS.map((group) => (
            <div key={group.category}>
              {/* Group heading */}
              <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#1a1a1a]">
                    {group.category}
                  </h2>
                  <p className="mt-1 text-[14px] text-[#6b6b6b]">{group.description}</p>
                </div>
                <div className="hidden h-px flex-1 bg-gradient-to-r from-black/10 to-transparent sm:ml-8 sm:block" />
              </div>

              {/* Tool cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.tools.map((tool) => {
                  const Icon = Icons[tool.icon] || Icons.sparkles;
                  return (
                    <Link
                      key={tool.title}
                      to="/login"
                      className="group relative overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-black/[0.12] hover:shadow-xl"
                    >
                      {/* Hover glow (accent-tinted) */}
                      <div
                        className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30"
                        style={{ background: tool.accent }}
                        aria-hidden="true"
                      />

                      <div className="relative">
                        {/* Icon */}
                        <div
                          className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border transition-colors"
                          style={{
                            color: tool.accent,
                            backgroundColor: `${tool.accent}0f`,
                            borderColor: `${tool.accent}26`,
                          }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <h3 className="text-[15.5px] font-semibold text-[#1a1a1a]">
                          {tool.title}
                        </h3>
                        <p className="mt-2 text-[13px] leading-6 text-[#6b6b6b]">
                          {tool.desc}
                        </p>

                        <div className="mt-6 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--coral)] transition-colors group-hover:text-[#1a1a1a]">
                          Try it now
                          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-24 overflow-hidden rounded-[36px] bg-[#1a1a1a] px-6 py-16 text-center text-white sm:px-12">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Ready to try{' '}
            <span className="font-serif-human italic text-[var(--coral)]">every tool?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[14.5px] text-white/60">
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[14px] font-semibold text-black transition hover:bg-gray-100 hover:-translate-y-0.5"
            >
              Start Creating Free <span>→</span>
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-[14px] font-medium text-white backdrop-blur transition hover:bg-white/10"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}