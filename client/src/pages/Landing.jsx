import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AuthModal from '../components/AuthModal';

/* ─────────────────────────────────────────────
   Single hero video — self-hosted in /public/videos/
   ───────────────────────────────────────────── */
const HERO_VIDEO = {
  src: '/videos/hero1.mp4',
  // Optional: drop a matching still frame in /public/videos/hero1.jpg
  // to avoid a black flash while the video buffers.
  poster: '/videos/hero1.jpg',
};

const TOOLS_MARQUEE = [
  'Text to Image', 'Text to Video', 'Talking Photo', 'Voice Cloning',
  'Face Swap', 'Lip Sync', 'Background Remover', 'Image Upscaler',
  'AI Colorizer', 'Video Translator', 'Auto Subtitles', 'Animation',
];

const GALLERY = [
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85',
];

const STEPS = [
  { step: '01', title: 'Describe your vision', desc: 'Type a prompt, upload an image, or record a voice note.' },
  { step: '02', title: 'Choose your style', desc: 'Select from cinematic, anime, 3D, or let AI surprise you.' },
  { step: '03', title: 'Share with the world', desc: 'Download in 4K or share directly to social media.' },
];

export default function Landing() {
  const [authMode, setAuthMode] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Sync Auth Modal with URL
  useEffect(() => {
    if (location.pathname === '/login') setAuthMode('login');
    else if (location.pathname === '/register') setAuthMode('register');
    else if (location.pathname === '/forgot-password') setAuthMode('forgot');
    else setAuthMode(null);
  }, [location.pathname]);

  // Navbar scroll state
  useEffect(() => {
    const onScroll = (e) => setScrolled(e.target.scrollTop > 12);
    const scroller = document.querySelector('.page-scroll');
    if (!scroller) return;
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, []);

  const openLogin = () => { setAuthMode('login'); navigate('/login'); };
  const openRegister = () => { setAuthMode('register'); navigate('/register'); };
  const closeAuth = () => { setAuthMode(null); navigate('/'); };
  const switchAuthMode = (nextMode) => {
    setAuthMode(nextMode);
    if (nextMode === 'login') navigate('/login');
    else if (nextMode === 'register') navigate('/register');
    else if (nextMode === 'forgot') navigate('/forgot-password');
  };

  return (
    <main id="top" className="page-scroll relative overflow-x-hidden bg-[#fdfbf7] text-[#1a1a1a]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap');

        :root {
          --warm-bg: #fdfbf7;
          --warm-surface: #ffffff;
          --warm-text: #1a1a1a;
          --warm-muted: #6b6b6b;
          --coral: #ff6b6b;
          --emerald: #10b981;
          --violet: #8b5cf6;
          --amber: #f59e0b;
        }

        body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        .font-serif-human { font-family: 'Playfair Display', serif; }

        .lp-btn {
          background: #1a1a1a;
          color: #fff;
          transition: all 0.25s cubic-bezier(0.2, 0.7, 0.2, 1);
        }
        .lp-btn:hover { background: #333; transform: translateY(-2px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.35); }

        .lp-blurred {
          filter: blur(12px) brightness(.7);
          pointer-events: none;
          user-select: none;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 32s linear infinite; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }

        /* Hero video */
        .hero-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transform: scale(1.04);
          transition: opacity 1.4s ease, transform 8s ease;
          will-change: opacity, transform;
        }
        .hero-video.is-ready {
          opacity: 1;
          transform: scale(1);
        }

        /* Subtle film grain so the video feels analog, not synthetic */
        .hero-grain {
          background-image:
            radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px);
          background-size: 3px 3px, 4px 4px;
          background-position: 0 0, 1px 2px;
          mix-blend-mode: overlay;
          opacity: 0.35;
        }

        /* Gentle entrance animation for hero copy */
        @keyframes rise {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rise { animation: rise 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
        .rise-delay-1 { animation-delay: 0.10s; }
        .rise-delay-2 { animation-delay: 0.20s; }
        .rise-delay-3 { animation-delay: 0.32s; }
        .rise-delay-4 { animation-delay: 0.44s; }

        @media (prefers-reduced-motion: reduce) {
          .animate-marquee, .animate-float, .rise { animation: none !important; }
          .hero-video { transition: opacity 0.4s ease; transform: none; }
        }
      `}</style>

      <div className={authMode ? 'lp-blurred' : ''}>
        <Navbar scrolled={scrolled} openLogin={openLogin} openRegister={openRegister} />

        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0d0d0d]">
          {/* Ambient video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
            aria-hidden="true"
            poster={HERO_VIDEO.poster}
            onCanPlay={() => setVideoReady(true)}
            onError={() => setVideoReady(true)} // fall back to gradient if missing
            className={`hero-video ${videoReady ? 'is-ready' : ''}`}
            src={HERO_VIDEO.src}
          />

          {/* Dark scrim — keeps the video visible but copy readable */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black/45" />

          {/* Vignette — softens the edges so text pops */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)',
            }}
          />

          {/* Film grain */}
          <div aria-hidden="true" className="hero-grain pointer-events-none absolute inset-0" />

          {/* Top fade — keeps navbar legible */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent"
          />

          {/* Bottom fade — blends hero into the cream page below */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-[#fdfbf7]/55 to-[#fdfbf7]"
          />

          {/* Hero copy */}
          <div className="relative z-10 mx-auto max-w-5xl px-5 text-center">
            <div className="rise rise-delay-1 mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] font-medium text-white/90 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-[var(--coral)] animate-pulse" />
              Trusted by 50,000+ creators worldwide
            </div>

            <h1 className="rise rise-delay-2 mx-auto max-w-4xl text-[44px] font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-[84px]">
              Imagine it.
              <br />
              <span className="font-serif-human italic font-medium text-[var(--coral)]">See it.</span>{' '}
              <span className="text-white">Share it.</span>
            </h1>

            <p className="rise rise-delay-3 mx-auto mt-6 max-w-xl text-[16px] leading-7 text-white/85">
              Bring your wildest ideas to life with AI. Generate cinematic videos, stunning images,
              and lifelike voices — all in seconds, all in one place.
            </p>

            <div className="rise rise-delay-4 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={openRegister}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-black shadow-lg shadow-black/20 transition hover:bg-white hover:-translate-y-0.5"
              >
                Start Creating Free
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </button>
              <a
                href="#showcase"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-[15px] font-medium text-white backdrop-blur transition hover:bg-white/20"
              >
                Explore Showcase
              </a>
            </div>

            <p className="rise rise-delay-4 mt-6 text-[12px] text-white/55">
              No credit card required · Free forever plan
            </p>
          </div>
        </section>

        {/* ═══════════════ MARQUEE ═══════════════ */}
        <section className="overflow-hidden border-y border-black/5 bg-white py-6">
          <div className="flex w-[200%] animate-marquee">
            {[...TOOLS_MARQUEE, ...TOOLS_MARQUEE].map((tool, i) => (
              <span key={i} className="mx-8 text-[13px] font-medium uppercase tracking-widest text-black/40">
                {tool} ✦
              </span>
            ))}
          </div>
        </section>

        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
        <section className="px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-semibold sm:text-4xl">Creativity in three steps.</h2>
              <p className="mt-3 text-[15px] text-[var(--warm-muted)]">
                No tutorials. No complex software. Just you and your imagination.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {STEPS.map((s) => (
                <div
                  key={s.step}
                  className="relative rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5 transition hover:shadow-xl hover:-translate-y-1"
                >
                  <span className="text-5xl font-bold text-black/5">{s.step}</span>
                  <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-[var(--warm-muted)]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ SHOWCASE GALLERY ═══════════════ */}
        <section id="showcase" className="px-5 py-24 sm:px-8 bg-white">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-3xl font-semibold sm:text-4xl">Made by humans. Powered by AI.</h2>
                <p className="mt-2 text-[15px] text-[var(--warm-muted)]">
                  A glimpse of what our community is creating today.
                </p>
              </div>
              <Link
                to="/showcase"
                className="text-[14px] font-semibold text-[var(--coral)] hover:underline"
              >
                View full gallery →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {GALLERY.map((src, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl bg-gray-100">
                  <img
                    src={src}
                    alt="AI Art"
                    loading="lazy"
                    className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="absolute bottom-4 left-4 text-white opacity-0 transition group-hover:opacity-100">
                    <p className="text-[12px] font-medium">Generated with Alveoly</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ FEATURES SPLIT ═══════════════ */}
        <section className="px-5 py-24 sm:px-8">
          <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-semibold leading-tight">
                Your new{' '}
                <span className="font-serif-human italic text-[var(--violet)]">creative partner.</span>
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-[var(--warm-muted)]">
                Whether you're a filmmaker, marketer, or just having fun, Alveoly gives you the power
                of a full production studio.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { title: 'Cinematic Video', desc: 'Turn text into 4K video clips.' },
                  { title: 'Studio Quality Audio', desc: 'Clone voices or generate music.' },
                  { title: 'Smart Image Editing', desc: 'Remove objects, upscale, or colorize.' },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--violet)]/10 text-[var(--violet)]">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold">{f.title}</h3>
                      <p className="text-[13px] text-[var(--warm-muted)]">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={openRegister}
                className="mt-10 rounded-full bg-black px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-black/80"
              >
                Try it for free
              </button>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-tr from-[var(--amber)]/20 to-[var(--coral)]/20 blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
                alt="Creative Studio"
                loading="lazy"
                className="relative rounded-[32px] shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 animate-float rounded-2xl bg-white p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--emerald)]/10 text-[var(--emerald)]">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-gray-500">Generated in</p>
                    <p className="text-[14px] font-bold">4.2 seconds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ CTA ═══════════════ */}
        <section className="px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[40px] bg-[#1a1a1a] px-6 py-20 text-center text-white">
            <h2 className="text-4xl font-semibold sm:text-5xl">
              Ready to make something{' '}
              <span className="font-serif-human italic text-[var(--coral)]">beautiful?</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[15px] text-white/60">
              Join thousands of creators using Alveoly Studios to bring their ideas to life.
            </p>
            <button
              onClick={openRegister}
              className="mt-10 rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-black transition hover:bg-gray-100"
            >
              Start Creating Free
            </button>
          </div>
        </section>
      </div>

      <Footer />
      {authMode && <AuthModal mode={authMode} onSwitchMode={switchAuthMode} onClose={closeAuth} />}
    </main>
  );
}