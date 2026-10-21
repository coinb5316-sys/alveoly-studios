// pages/About.jsx
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

/* ─────────────────────────────────────────────
   Inline icons (consistent with admin dashboard)
   ───────────────────────────────────────────── */
const Icon = ({ path, className = 'h-4 w-4' }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
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
   Shared gradient text accent
   ───────────────────────────────────────────── */
const GradientText = ({ children }) => (
  <span className="bg-gradient-to-r from-[#c4b5fd] via-[#a78bfa] to-[#818cf8] bg-clip-text text-transparent">
    {children}
  </span>
);

/* ─────────────────────────────────────────────
   Tech stack card
   ───────────────────────────────────────────── */
function TechCard({ icon, title, subtitle, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-lg hover:shadow-black/20">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30"
        style={{ background: accent }}
      />
      <div className="relative flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
          style={{ color: accent, backgroundColor: `${accent}1f` }}
        >
          <Icon path={icon} className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold text-white">{title}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-white/45">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Value pillar
   ───────────────────────────────────────────── */
function ValueCard({ icon, title, body, accent }) {
  return (
    <div className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-5 transition-all duration-300 hover:border-white/[0.14]">
      <span
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
        style={{ color: accent, backgroundColor: `${accent}1a` }}
      >
        <Icon path={icon} className="h-4.5 w-4.5" />
      </span>
      <h3 className="text-[13.5px] font-semibold text-white">{title}</h3>
      <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">{body}</p>
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
      accent: '#a78bfa',
    },
    {
      icon: ICONS.heart,
      title: 'Built with care',
      body: 'Every detail — from the copy to the color — is chosen to respect your time and make creation feel effortless.',
      accent: '#fb7185',
    },
    {
      icon: ICONS.globe,
      title: 'Rooted in Ghana, built for the world',
      body: 'We are proudly Ghanaian, designing for creators across Africa and beyond with fair, transparent pricing.',
      accent: '#34d399',
    },
    {
      icon: ICONS.shield,
      title: 'Your work, your data',
      body: 'You own everything you generate. No training on your content, no hidden reuse — just clean, private storage.',
      accent: '#38bdf8',
    },
  ];

  const stack = [
    { icon: ICONS.sparkles, title: 'Magic Hour AI', subtitle: 'Video, image & audio generation', accent: '#a78bfa' },
    { icon: ICONS.cloud, title: 'Cloudinary', subtitle: 'Fast, global asset storage', accent: '#38bdf8' },
    { icon: ICONS.creditCard, title: 'Paystack', subtitle: 'Secure payments across Africa', accent: '#34d399' },
    { icon: ICONS.layers, title: 'React + Vite', subtitle: 'A snappy, modern frontend', accent: '#fbbf24' },
    { icon: ICONS.server, title: 'Node.js + Express', subtitle: 'A lean, reliable backend', accent: '#fb7185' },
    { icon: ICONS.database, title: 'MongoDB', subtitle: 'Flexible data at scale', accent: '#818cf8' },
  ];

  return (
    <main
      id="top"
      className="page-scroll min-h-screen bg-[var(--surface-0)] text-[var(--text-primary)]"
    >
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-5 pt-32 pb-16 sm:px-8">
        {/* Soft ambient glows — blends into surface */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-emerald-500/[0.07] blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[11px] font-medium text-violet-200">
            <Icon path={ICONS.sparkles} className="h-3 w-3" />
            About the studio
          </span>

          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Creativity, <GradientText>amplified</GradientText> by AI.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[14.5px] leading-relaxed text-white/55">
            Alveoly Studios brings the world’s best generative models into one calm,
            beautiful studio — so you can spend less time juggling tools and more
            time making things people love.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:shadow-violet-500/35"
            >
              Start creating
              <Icon path={ICONS.arrow} className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-[12.5px] font-medium text-white/75 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="px-5 pb-16 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white">Our story</h2>
            <div className="mt-4 space-y-4 text-[13.5px] leading-7 text-white/55">
              <p>
                Alveoly Studios was born in <span className="font-medium text-white/80">Ghana 🇬🇭</span>{' '}
                with a simple, stubborn belief: professional AI tools shouldn’t be a
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
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-white">What we believe</h2>
            <p className="mt-2 text-[13px] text-white/45">
              The principles that shape every decision we make.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {values.map((v) => (
              <ValueCard key={v.title} {...v} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech stack ── */}
      <section className="px-5 pb-20 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold text-white">Under the hood</h2>
              <p className="mt-2 text-[13px] text-white/45">
                The tools we trust to power every generation.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10.5px] font-medium uppercase tracking-wider text-white/45">
              <Icon path={ICONS.code} className="h-3 w-3" />
              Modern, dependable stack
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stack.map((s) => (
              <TechCard key={s.title} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-5 pb-24 sm:px-8">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-violet-500/[0.12] via-fuchsia-500/[0.06] to-transparent p-8 text-center">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[10.5px] font-medium text-violet-200">
              <Icon path={ICONS.rocket} className="h-3 w-3" />
              Ready when you are
            </span>
            <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
              Bring your next idea to life.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-white/50">
              No setup, no steep learning curve — just your imagination and the
              best AI models, working together.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-violet-500/40"
              >
                <Icon path={ICONS.zap} className="h-3.5 w-3.5" />
                Open the studio
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-[12.5px] font-medium text-white/75 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}