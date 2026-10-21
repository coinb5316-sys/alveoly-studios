// pages/About.jsx
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

/* ─────────────────────────────────────────────
   Inline icons
   ───────────────────────────────────────────── */
const Icon = ({ path, className = 'h-4 w-4' }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={path} />
  </svg>
);

const ICONS = {
  sparkles: 'M12 3l1.9 5.7L20 10l-5.7 1.9L12 18l-1.9-5.7L4 10l5.7-1.9L12 3z',
  globe: 'M12 22a10 10 0 100-20 10 10 0 000 20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z',
  heart: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  rocket: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2zM9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
  database: 'M12 2c5 0 9 1.34 9 3s-4 3-9 3-9-1.34-9-3 4-3 9-3zM3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6',
  cloud: 'M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z',
  creditCard: 'M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2zM1 10h22',
  layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  server: 'M20 9H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2zM4 3h16a2 2 0 012 2v2H2V5a2 2 0 012-2zM6 15h.01M6 19h.01',
  arrow: 'M5 12h14M12 5l7 7-7 7',
};

/* ─────────────────────────────────────────────
   Tech card (cream theme)
   ───────────────────────────────────────────── */
function TechCard({ icon, title, subtitle, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-black/[0.12] hover:shadow-md">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20"
        style={{ background: accent }}
      />
      <div className="relative flex items-start gap-3.5">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
          style={{ color: accent, backgroundColor: `${accent}14` }}
        >
          <Icon path={icon} className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-[#1a1a1a]">{title}</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-[#6b6b6b]">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Value card (cream theme)
   ───────────────────────────────────────────── */
function ValueCard({ icon, title, body, accent }) {
  return (
    <div className="group relative rounded-2xl border border-black/[0.07] bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-black/[0.12] hover:shadow-md">
      <span
        className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
        style={{ color: accent, backgroundColor: `${accent}14` }}
      >
        <Icon path={icon} className="h-5 w-5" />
      </span>
      <h3 className="text-[15px] font-semibold text-[#1a1a1a]">{title}</h3>
      <p className="mt-2 text-[13px] leading-6 text-[#6b6b6b]">{body}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main
   ───────────────────────────────────────────── */
export default function About() {
  const values = [
    {
      icon: ICONS.sparkles,
      title: 'Creativity for everyone',
      body: 'World-class AI tools shouldn’t be locked behind enterprise contracts. We keep it simple, fast, and accessible.',
      accent: '#ff6b6b', // coral (from pricing)
    },
    {
      icon: ICONS.heart,
      title: 'Built with care',
      body: 'Every detail — from the copy to the color — is chosen to respect your time and make creation feel effortless.',
      accent: '#e07a5f',
    },
    {
      icon: ICONS.globe,
      title: 'Rooted in Ghana, built for the world',
      body: 'We are proudly Ghanaian, designing for creators across Africa and beyond with fair, transparent pricing.',
      accent: '#2a9d8f',
    },
    {
      icon: ICONS.shield,
      title: 'Your work, your data',
      body: 'You own everything you generate. No training on your content, no hidden reuse — just clean, private storage.',
      accent: '#6b5b95', // violet (from pricing var)
    },
  ];

  const stack = [
    { icon: ICONS.sparkles, title: 'Magic Hour AI', subtitle: 'Video, image & audio generation', accent: '#ff6b6b' },
    { icon: ICONS.cloud, title: 'Cloudinary', subtitle: 'Fast, global asset storage', accent: '#2a9d8f' },
    { icon: ICONS.creditCard, title: 'Paystack', subtitle: 'Secure payments across Africa', accent: '#e07a5f' },
    { icon: ICONS.layers, title: 'React + Vite', subtitle: 'A snappy, modern frontend', accent: '#6b5b95' },
    { icon: ICONS.server, title: 'Node.js + Express', subtitle: 'A lean, reliable backend', accent: '#4a7c59' },
    { icon: ICONS.database, title: 'MongoDB', subtitle: 'Flexible data at scale', accent: '#8a5a44' },
  ];

  return (
    <main
      id="top"
      className="page-scroll min-h-screen overflow-x-hidden bg-[#fdfbf7] text-[#1a1a1a]"
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-[var(--coral)] opacity-[0.06] blur-[130px]" />
        <div className="absolute top-[45%] right-[10%] h-[420px] w-[420px] rounded-full bg-[var(--violet)] opacity-[0.05] blur-[130px]" />
      </div>

      <Navbar />

      {/* ── Hero ── */}
      <section className="relative px-5 pt-28 pb-16 sm:px-8 sm:pt-32">
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-[11.5px] font-medium text-[#4a4a4a] backdrop-blur">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--coral)] animate-pulse" />
            About the studio
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[60px] lg:leading-[1.05]">
            Creativity,{' '}
            <span className="font-serif-human italic font-medium text-[var(--coral)]">
              amplified
            </span>{' '}
            by AI.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-[#6b6b6b] sm:text-base">
            Alveoly Studios brings the world’s best generative models into one calm,
            beautiful studio — so you can spend less time juggling tools and more
            time making things people love.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-7 py-3.5 text-[14px] font-semibold text-white transition hover:bg-[#2b2b2b] hover:-translate-y-0.5"
            >
              Start creating
              <Icon path={ICONS.arrow} className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-7 py-3.5 text-[14px] font-medium text-[#1a1a1a] transition hover:border-black/20 hover:bg-black/[0.03]"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="px-5 pb-16 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-black/[0.07] bg-white p-8 shadow-sm sm:p-10">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--coral)]">
              Our story
            </span>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1a1a1a]">
              A studio built for the way{' '}
              <span className="font-serif-human italic text-[var(--coral)]">
                creators actually work.
              </span>
            </h2>
            <div className="mt-5 space-y-4 text-[14px] leading-7 text-[#4a4a4a]">
              <p>
                Alveoly Studios was born in{' '}
                <span className="font-medium text-[#1a1a1a]">Ghana 🇬🇭</span> with a
                simple, stubborn belief: professional AI tools shouldn’t be a
                privilege. They should feel as natural as opening a notebook.
              </p>
              <p>
                We watched too many talented creators — designers, filmmakers,
                musicians, marketers — spend their energy stitching together half a
                dozen tools instead of making their next great thing. So we built the
                studio we wished existed: one place, one login, every model you need.
              </p>
              <p>
                Today, Alveoly Studios blends the world’s best generative models with a
                warm, focused interface. Whether you’re shipping your first campaign or
                your five-hundredth film, we’re here to make your ideas real — faster,
                kinder, and a little more delightful.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="px-5 pb-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              What we{' '}
              <span className="font-serif-human italic text-[var(--coral)]">believe.</span>
            </h2>
            <p className="mt-2 text-[14px] text-[#6b6b6b]">
              The principles that shape every decision we make.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {values.map((v) => (
              <ValueCard key={v.title} {...v} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech stack ── */}
      <section className="px-5 pb-20 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Under the{' '}
                <span className="font-serif-human italic text-[var(--coral)]">hood.</span>
              </h2>
              <p className="mt-2 text-[14px] text-[#6b6b6b]">
                The tools we trust to power every generation.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[#6b6b6b] backdrop-blur">
              <Icon path={ICONS.code} className="h-3 w-3" />
              Modern, dependable stack
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stack.map((s) => (
              <TechCard key={s.title} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA (dark, matches pricing bottom block) ── */}
      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[36px] bg-[#1a1a1a] px-6 py-16 text-center text-white sm:px-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium text-white/70 backdrop-blur">
            <Icon path={ICONS.rocket} className="h-3 w-3" />
            Ready when you are
          </span>
          <h2 className="mt-5 text-3xl font-semibold sm:text-4xl">
            Bring your next idea to{' '}
            <span className="font-serif-human italic text-[var(--coral)]">life.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[14.5px] text-white/60">
            No setup, no steep learning curve — just your imagination and the best
            AI models, working together.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[14px] font-semibold text-black transition hover:bg-gray-100 hover:-translate-y-0.5"
            >
              <Icon path={ICONS.zap} className="h-4 w-4" />
              Open the studio
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-[14px] font-medium text-white backdrop-blur transition hover:bg-white/10"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}