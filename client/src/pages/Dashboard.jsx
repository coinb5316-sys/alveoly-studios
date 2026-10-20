import { useEffect, useState } from 'react';
import { useNavigate, NavLink, Routes, Route, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';

// Generators (unchanged)
import ImageGenerator from '../components/generators/ImageGenerator';
import VideoGenerator from '../components/generators/VideoGenerator';
import ImageToVideoGenerator from '../components/generators/ImageToVideoGenerator';
import VideoToVideoGenerator from '../components/generators/VideoToVideoGenerator';
import AudioGenerator from '../components/generators/AudioGenerator';
import BackgroundRemover from '../components/generators/BackgroundRemover';
import TalkingPhotoGenerator from '../components/generators/TalkingPhotoGenerator';
import UpscaleGenerator from '../components/generators/UpscaleGenerator';
import LipSyncGenerator from '../components/generators/LipSyncGenerator';
import HeadshotGenerator from '../components/generators/HeadshotGenerator';
import PhotoColorizerGenerator from '../components/generators/PhotoColorizerGenerator';
import FaceSwapGenerator from '../components/generators/FaceSwapGenerator';
import ImageEditorGenerator from '../components/generators/ImageEditorGenerator';
import SubtitleGenerator from '../components/generators/SubtitleGenerator';
import TranslatorGenerator from '../components/generators/TranslatorGenerator';
import GifGenerator from '../components/generators/GifGenerator';
import AnimationGenerator from '../components/generators/AnimationGenerator';

// Studio components (unchanged except Showcase removed)
import Library from '../components/studio/Library';
import QueueDrawer from '../components/studio/QueueDrawer';
import CommandPalette from '../components/studio/CommandPalette';
import UpgradeBanner from '../components/billing/UpgradeBanner';
import Billing from './Billing';

/* ─────────────────────────────────────────────
   Hero video for the dashboard banner
   Reuses the same self-hosted file as Landing
   ───────────────────────────────────────────── */
const DASHBOARD_HERO = {
  src: '/videos/hero1.mp4',
  poster: '/videos/hero1.jpg',
};

/* ─────────────────────────────────────────────
   NAV — warm charcoal + coral/violet accents
   ───────────────────────────────────────────── */
const NAV = [
  { to: '/dashboard/image',              label: 'Image',         desc: 'Text to image',          icon: 'image',          accent: '#8b5cf6' },
  { to: '/dashboard/image-edit',         label: 'Edit Image',    desc: 'Prompt-based edits',     icon: 'edit',           accent: '#0ea5e9' },
  { to: '/dashboard/video',              label: 'Video',         desc: 'Text to video',          icon: 'video',          accent: '#10b981' },
  { to: '/dashboard/image-to-video',     label: 'Image → Video', desc: 'Animate a still',        icon: 'image-to-video', accent: '#0ea5e9' },
  { to: '/dashboard/video-to-video',     label: 'Video → Video', desc: 'Restyle footage',        icon: 'video-to-video', accent: '#ec4899' },
  { to: '/dashboard/talking-photo',      label: 'Talking Photo', desc: 'Animate portraits',      icon: 'talking-photo',  accent: '#f59e0b' },
  { to: '/dashboard/lip-sync',           label: 'Lip Sync',      desc: 'Match audio to video',   icon: 'lip-sync',       accent: '#22d3ee' },
  { to: '/dashboard/face-swap',          label: 'Face Swap',     desc: 'Swap faces in photos',   icon: 'face-swap',      accent: '#f43f5e' },
  { to: '/dashboard/subtitle',           label: 'Subtitles',     desc: 'Auto subtitles',         icon: 'subtitle',       accent: '#facc15' },
  { to: '/dashboard/translate',          label: 'Translate',     desc: 'Translate video audio',  icon: 'translate',      accent: '#0ea5e9' },
  { to: '/dashboard/gif',                label: 'GIF',           desc: 'Text to GIF',            icon: 'gif',            accent: '#fb923c' },
  { to: '/dashboard/animation',          label: 'Animation',     desc: 'Animate images',         icon: 'animation',      accent: '#a3e635' },
  { to: '/dashboard/background-removal', label: 'Cutout',        desc: 'Remove backgrounds',     icon: 'cutout',         accent: '#fb7185' },
  { to: '/dashboard/upscale',            label: 'Upscale',       desc: 'Enhance resolution',     icon: 'upscale',        accent: '#8b5cf6' },
  { to: '/dashboard/headshot',           label: 'Headshot',      desc: 'Professional portraits', icon: 'headshot',       accent: '#f472b6' },
  { to: '/dashboard/colorize',           label: 'Colorize',      desc: 'Colorize B&W photos',    icon: 'colorize',       accent: '#fbbf24' },
  { to: '/dashboard/audio',              label: 'Audio',         desc: 'Voice · Music · FX',     icon: 'audio',          accent: '#fbbf24' },
  { to: '/dashboard/library',            label: 'Library',       desc: 'Your creations',         icon: 'library',        accent: '#60a5fa' },
];

const ICONS = {
  // ... Paste all your existing icons here, unchanged ...
};

/* ─────────────────────────────────────────────
   Showcase gallery — same images as marketing
   Showcase, rendered on warm charcoal
   ───────────────────────────────────────────── */
const GALLERY = [
  { id: 1, src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=85', alt: 'Abstract neon waves', prompt: 'Flowing neon waves, cinematic, 8K', accent: '#ff6b6b' },
  { id: 2, src: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=85', alt: 'Cosmic nebula', prompt: 'Deep space nebula, volumetric light', accent: '#8b5cf6' },
  { id: 3, src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=85', alt: 'Portrait with dramatic light', prompt: 'Studio portrait, rim lighting, 85mm', accent: '#f59e0b' },
  { id: 4, src: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=1200&q=85', alt: 'Geometric neon corridor', prompt: 'Futuristic corridor, neon geometry', accent: '#10b981' },
  { id: 5, src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85', alt: 'Mountain range at dawn', prompt: 'Alpine peaks at sunrise, 4K film', accent: '#ec4899' },
  { id: 6, src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85', alt: 'Product watch shot', prompt: 'Luxury watch macro, softbox lighting', accent: '#f472b6' },
  { id: 7, src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85', alt: 'Candid portrait', prompt: 'Natural portrait, golden hour, bokeh', accent: '#fb923c' },
  { id: 8, src: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=85', alt: 'Sunset gradient', prompt: 'Desert sunset, warm gradient sky', accent: '#f43f5e' },
];

/* Brand mark — coral → violet gradient (matches Landing) */
function BrandMark() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6b6b] via-[#c084fc] to-[#8b5cf6] text-[15px] font-bold text-white shadow-[0_8px_24px_-4px_rgba(139,92,246,0.45)]">
      A
      <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition group-hover:opacity-100" />
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { activeCount } = useQueue();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { src, alt, prompt } | null
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => setMobileNav(false), [location.pathname]);

  // ⌘K palette + Esc to close palette/lightbox
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false);
        setLightbox(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Lightbox arrow navigation
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') {
        const idx = GALLERY.findIndex((i) => i.src === lightbox.src);
        const next = GALLERY[(idx + 1) % GALLERY.length];
        setLightbox({ src: next.src, alt: next.alt, prompt: next.prompt });
      }
      if (e.key === 'ArrowLeft') {
        const idx = GALLERY.findIndex((i) => i.src === lightbox.src);
        const prev = GALLERY[(idx - 1 + GALLERY.length) % GALLERY.length];
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

  const initials = (user?.email || 'A').slice(0, 1).toUpperCase();
  const isRoot = location.pathname === '/dashboard' || location.pathname === '/dashboard/';
  const currentItem = NAV.find((n) => location.pathname.startsWith(n.to));
  const currentLabel = currentItem?.label ?? (isRoot ? 'Home' : '');
  const firstName = user?.email ? user.email.split('@')[0] : 'creator';

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#0e0d0c] text-white">
      {/* Ambient glows — warm charcoal, same family as Landing */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[20%] left-[15%] h-[720px] w-[720px] rounded-full bg-[#8b5cf6] opacity-[0.11] blur-[140px]" />
        <div className="absolute -bottom-[10%] right-[5%] h-[520px] w-[520px] rounded-full bg-[#ff6b6b] opacity-[0.06] blur-[140px]" />
        <div className="absolute top-[30%] right-[30%] h-[400px] w-[400px] rounded-full bg-[#f59e0b] opacity-[0.04] blur-[120px]" />
      </div>

      <div className="flex h-full min-h-0 w-full">
        {/* ═══════════ SIDEBAR ═══════════ */}
        <aside
          className={`${
            mobileNav
              ? 'fixed inset-0 z-40 flex w-full max-w-[280px] flex-col bg-[#0e0d0c]/98 backdrop-blur-xl'
              : 'hidden'
          } lg:relative lg:z-auto lg:flex lg:w-[248px] lg:shrink-0 lg:flex-col lg:border-r lg:border-white/[0.05] lg:bg-[#0e0d0c]/55 lg:backdrop-blur-xl`}
        >
          <div className="shrink-0 px-4 pt-5 pb-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="group flex items-center gap-3 rounded-2xl p-1 text-left transition"
            >
              <BrandMark />
              <div>
                <p className="text-[14px] font-semibold leading-tight tracking-tight text-white">
                  Alveoly
                </p>
                <p className="font-serif-human text-[11px] italic leading-tight text-white/40">
                  AI Studio
                </p>
              </div>
            </button>

            <button
              onClick={() => setPaletteOpen(true)}
              className="group mt-4 flex w-full items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[12px] text-white/40 transition hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-white/70"
            >
              {ICONS.search}
              <span className="flex-1 text-left">Search or jump to…</span>
              <kbd className="rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9.5px] text-white/40">
                ⌘K
              </kbd>
            </button>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
            <p className="mb-2 px-3 text-[9.5px] font-semibold uppercase tracking-[0.15em] text-white/25">
              Studios
            </p>
            <div className="space-y-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                      isActive
                        ? 'bg-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.06)]'
                        : 'text-white/55 hover:bg-white/[0.03] hover:text-white/90'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
                          style={{ background: item.accent }}
                        />
                      )}
                      <span style={{ color: isActive ? item.accent : 'currentColor' }}>
                        {ICONS[item.icon]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium leading-tight">{item.label}</p>
                        <p className="text-[10px] text-white/30">{item.desc}</p>
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="my-3 h-px bg-white/[0.05]" />

            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition ${
                  isActive
                    ? 'bg-white/[0.06] text-white'
                    : 'text-white/55 hover:bg-white/[0.03] hover:text-white/90'
                }`
              }
            >
              <span className="text-white/40">{ICONS.home}</span>
              Home
            </NavLink>

            <NavLink
              to="/dashboard/billing"
              className={({ isActive }) =>
                `mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition ${
                  isActive
                    ? 'bg-white/[0.06] text-white'
                    : 'text-white/55 hover:bg-white/[0.03] hover:text-white/90'
                }`
              }
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
              Billing
            </NavLink>

            {user?.role === 'admin' && (
              <>
                <div className="my-3 h-px bg-white/[0.05]" />
                <NavLink
                  to="/admin"
                  className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2.5 text-[13px] text-red-300 transition hover:bg-red-500/[0.12] hover:text-red-200"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-[18px] w-[18px]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium leading-tight">Admin Panel</p>
                    <p className="text-[10px] text-red-400/60">Manage platform</p>
                  </div>
                </NavLink>
              </>
            )}
          </nav>

          {/* User card */}
          <div className="shrink-0 border-t border-white/[0.05] p-3">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 backdrop-blur-xl">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6b6b] to-[#8b5cf6] text-[12px] font-semibold text-white">
                    {initials}
                  </div>
                  {activeCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0e0d0c] bg-[#34d399]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11.5px] font-medium text-white/90">
                    {user?.email || 'Guest'}
                  </p>
                  <p className="text-[10px] text-white/35">
                    {user?.role === 'admin' ? (
                      <span className="font-semibold uppercase text-red-400">Admin</span>
                    ) : (
                      <span className="capitalize">{user?.plan || 'Free'} Plan</span>
                    )}{' '}
                    · {user?.credits ?? 0} credits
                  </p>
                </div>
              </div>

              <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#8b5cf6] transition-[width] duration-500"
                  style={{ width: `${Math.min(100, ((user?.credits ?? 0) / 100) * 100)}%` }}
                />
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="mt-2.5 w-full rounded-lg border border-white/[0.06] py-1.5 text-[10.5px] font-medium text-white/45 transition hover:border-red-500/30 hover:bg-red-500/[0.06] hover:text-red-300"
              >
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {mobileNav && (
          <div
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setMobileNav(false)}
          />
        )}

        {/* ═══════════ MAIN ═══════════ */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="shrink-0 border-b border-white/[0.05] bg-[#0e0d0c]/55 backdrop-blur-xl">
            <div className="flex h-14 items-center justify-between px-4 lg:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => setMobileNav(true)}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 lg:hidden"
                  aria-label="Open menu"
                >
                  ☰
                </button>
                {isRoot ? (
                  <div className="flex items-center gap-2.5">
                    <span className="text-[13px] font-semibold text-white">Home</span>
                    <span className="hidden text-[11px] text-white/35 sm:block">
                      · Welcome back
                    </span>
                  </div>
                ) : (
                  <div className="flex min-w-0 items-center gap-2 text-[12px]">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="text-white/40 transition hover:text-white/80"
                    >
                      Dashboard
                    </button>
                    <span className="text-white/20">/</span>
                    <span className="flex items-center gap-2 font-medium text-white/90">
                      {currentItem && (
                        <span style={{ color: currentItem.accent }}>
                          {ICONS[currentItem.icon]}
                        </span>
                      )}
                      {currentLabel}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <div className="flex items-center gap-1.5 rounded-full border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-2.5 py-1 text-[10.5px] font-medium text-[#c4b5fd]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8b5cf6] opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />
                    </span>
                    {activeCount} generating
                  </div>
                )}
                <div className="hidden items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[10.5px] text-white/50 sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
                  {user?.credits ?? 0} credits
                </div>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1500px] px-4 py-6 lg:px-6 lg:py-8">
              {isRoot && <UpgradeBanner />}

              {/* ═══════════ HERO VIDEO BANNER (root only) ═══════════ */}
              {isRoot && (
                <div className="relative mb-10 overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0a0908]">
                  {/* Video background */}
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    disablePictureInPicture
                    aria-hidden="true"
                    poster={DASHBOARD_HERO.poster}
                    onCanPlay={() => setVideoReady(true)}
                    onError={() => setVideoReady(true)}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                      videoReady ? 'opacity-100' : 'opacity-0'
                    }`}
                    src={DASHBOARD_HERO.src}
                  />

                  {/* Dark scrim — matches Landing hero treatment */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-black/55"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)',
                    }}
                  />
                  {/* Bottom fade into warm charcoal */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#0e0d0c]"
                  />

                  {/* Banner copy */}
                  <div className="relative px-6 py-12 sm:px-10 sm:py-16">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/85 backdrop-blur-md">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-[#ff6b6b] animate-pulse" />
                      Welcome back, {firstName}
                    </div>

                    <h1 className="max-w-2xl text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-[44px]">
                      What will you{' '}
                      <span className="font-serif-human italic font-medium text-[#ff6b6b]">
                        create today?
                      </span>
                    </h1>

                    <p className="mt-3 max-w-xl text-[13.5px] leading-6 text-white/70 sm:text-[14px]">
                      Pick a studio below, or press{' '}
                      <kbd className="rounded border border-white/15 bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">
                        ⌘K
                      </kbd>{' '}
                      to jump anywhere. {user?.credits ?? 0} credits available.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-2">
                      <Link
                        to="/dashboard/image"
                        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[12.5px] font-semibold text-black transition hover:bg-white/90 hover:-translate-y-0.5"
                      >
                        Generate an image
                        <span>→</span>
                      </Link>
                      <Link
                        to="/dashboard/video"
                        className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-[12.5px] font-medium text-white backdrop-blur transition hover:bg-white/20"
                      >
                        Make a video
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════ QUICK-ACTION GRID (root only) ═══════════ */}
              {isRoot && (
                <div className="mb-10">
                  <div className="mb-4 flex items-end justify-between">
                    <div>
                      <h2 className="text-[15px] font-semibold text-white">Jump into a studio</h2>
                      <p className="mt-0.5 text-[12px] text-white/40">
                        18 tools, one workspace.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {NAV.slice(0, 12).map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.04]"
                      >
                        <div
                          className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-25"
                          style={{ background: item.accent }}
                        />
                        <div
                          className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{
                            color: item.accent,
                            backgroundColor: `${item.accent}1a`,
                          }}
                        >
                          {ICONS[item.icon]}
                        </div>
                        <p className="text-[12.5px] font-semibold leading-tight text-white">
                          {item.label}
                        </p>
                        <p className="mt-0.5 text-[10.5px] text-white/35">{item.desc}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══════════ CLICKABLE SHOWCASE (root only) ═══════════ */}
              {isRoot && (
                <div className="mb-10">
                  <div className="mb-4 flex items-end justify-between">
                    <div>
                      <h2 className="text-[15px] font-semibold text-white">
                        Made with{' '}
                        <span className="font-serif-human italic text-[#ff6b6b]">Alveoly</span>
                      </h2>
                      <p className="mt-0.5 text-[12px] text-white/40">
                        Click any piece to view full-size. Use ← → to browse.
                      </p>
                    </div>
                  </div>

                  <div className="columns-2 gap-3 md:columns-3 xl:columns-4">
                    {GALLERY.map((item) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          setLightbox({ src: item.src, alt: item.alt, prompt: item.prompt })
                        }
                        className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] text-left transition hover:border-white/[0.12]"
                      >
                        <img
                          src={item.src}
                          alt={item.alt}
                          loading="lazy"
                          className="w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                        />

                        {/* Hover gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                        {/* Hover prompt */}
                        <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          <span
                            className="mb-1.5 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                            style={{
                              backgroundColor: `${item.accent}33`,
                              color: item.accent,
                            }}
                          >
                            Prompt
                          </span>
                          <p className="text-[11px] font-medium leading-4 text-white/90">
                            “{item.prompt}”
                          </p>
                        </div>

                        {/* Accent glow */}
                        <div
                          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30"
                          style={{ background: item.accent }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══════════ ROUTED GENERATORS (unchanged) ═══════════ */}
              <Routes>
                <Route index element={null} />
                <Route path="image" element={<ImageGenerator key="image" />} />
                <Route path="image-edit" element={<ImageEditorGenerator key="image-edit" />} />
                <Route path="video" element={<VideoGenerator key="video" />} />
                <Route path="image-to-video" element={<ImageToVideoGenerator key="image-to-video" />} />
                <Route path="video-to-video" element={<VideoToVideoGenerator key="video-to-video" />} />
                <Route path="talking-photo" element={<TalkingPhotoGenerator key="talking-photo" />} />
                <Route path="lip-sync" element={<LipSyncGenerator key="lip-sync" />} />
                <Route path="face-swap" element={<FaceSwapGenerator key="face-swap" />} />
                <Route path="subtitle" element={<SubtitleGenerator key="subtitle" />} />
                <Route path="translate" element={<TranslatorGenerator key="translate" />} />
                <Route path="gif" element={<GifGenerator key="gif" />} />
                <Route path="animation" element={<AnimationGenerator key="animation" />} />
                <Route path="background-removal" element={<BackgroundRemover key="background-removal" />} />
                <Route path="upscale" element={<UpscaleGenerator key="upscale" />} />
                <Route path="headshot" element={<HeadshotGenerator key="headshot" />} />
                <Route path="colorize" element={<PhotoColorizerGenerator key="colorize" />} />
                <Route path="audio" element={<AudioGenerator key="audio" />} />
                <Route path="library" element={<Library key="library" />} />
                <Route path="billing" element={<Billing />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>

      <QueueDrawer />
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}

      {/* ═══════════ LIGHTBOX (dashboard version) ═══════════ */}
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
    </div>
  );
}