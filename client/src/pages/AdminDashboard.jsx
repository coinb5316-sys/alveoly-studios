import { useEffect, useState } from 'react';
import { useNavigate, NavLink, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';

// --- Generators (All 18) ---
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
import Library from '../components/studio/Library';
import Showcase from '../components/studio/Showcase';

// --- Admin Components ---
import AdminOverview from '../components/admin/AdminOverview';
import AdminUsers from '../components/admin/AdminUsers';
import AdminSettings from '../components/admin/AdminSettings';
import AdminPayments from '../components/admin/AdminPayments';
import AdminChat from '../components/admin/AdminChat'; // NEW

// --- UI Components ---
import QueueDrawer from '../components/studio/QueueDrawer';
import CommandPalette from '../components/studio/CommandPalette';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const STUDIO_NAV = [
  { to: '/admin/studio/image', label: 'Image', icon: 'image', accent: '#8b5cf6' },
  { to: '/admin/studio/image-edit', label: 'Edit Image', icon: 'edit', accent: '#06b6d4' },
  { to: '/admin/studio/video', label: 'Video', icon: 'video', accent: '#10b981' },
  { to: '/admin/studio/image-to-video', label: 'Image → Video', icon: 'image-to-video', accent: '#06b6d4' },
  { to: '/admin/studio/video-to-video', label: 'Video → Video', icon: 'video-to-video', accent: '#ec4899' },
  { to: '/admin/studio/talking-photo', label: 'Talking Photo', icon: 'talking-photo', accent: '#f59e0b' },
  { to: '/admin/studio/lip-sync', label: 'Lip Sync', icon: 'lip-sync', accent: '#22d3ee' },
  { to: '/admin/studio/face-swap', label: 'Face Swap', icon: 'face-swap', accent: '#f43f5e' },
  { to: '/admin/studio/subtitle', label: 'Subtitles', icon: 'subtitle', accent: '#facc15' },
  { to: '/admin/studio/translate', label: 'Translate', icon: 'translate', accent: '#0ea5e9' },
  { to: '/admin/studio/gif', label: 'GIF', icon: 'gif', accent: '#fb923c' },
  { to: '/admin/studio/animation', label: 'Animation', icon: 'animation', accent: '#a3e635' },
  { to: '/admin/studio/background-removal', label: 'Cutout', icon: 'cutout', accent: '#fb7185' },
  { to: '/admin/studio/upscale', label: 'Upscale', icon: 'upscale', accent: '#8b5cf6' },
  { to: '/admin/studio/headshot', label: 'Headshot', icon: 'headshot', accent: '#f472b6' },
  { to: '/admin/studio/colorize', label: 'Colorize', icon: 'colorize', accent: '#fbbf24' },
  { to: '/admin/studio/audio', label: 'Audio', icon: 'audio', accent: '#fbbf24' },
  { to: '/admin/studio/library', label: 'Library', icon: 'library', accent: '#60a5fa' },
];

const ADMIN_NAV = [
  { to: '/admin', label: 'Overview', icon: 'dashboard', exact: true },
  { to: '/admin/users', label: 'Users', icon: 'users', exact: false },
  { to: '/admin/payments', label: 'Payments', icon: 'payments', exact: false },
  { to: '/admin/chat', label: 'Live Chat', icon: 'chat', exact: false, badgeKey: 'chat' }, // NEW
  { to: '/admin/settings', label: 'Settings & Pricing', icon: 'settings', exact: false },
];

// Icons
const ICONS = {
  dashboard: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" /></svg>,
  users: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  payments: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>,
  chat: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  settings: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  image: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.5"/><path d="m21 15-5-5L5 21" strokeLinecap="round"/></svg>,
  edit: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>,
  video: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="15" height="14" rx="2.5"/><path d="m17 9 5-3v12l-5-3V9Z"/></svg>,
  'image-to-video': <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="12" height="12" rx="2"/><circle cx="6" cy="8" r="1"/><path d="m12 14-3-3-3 3"/><path d="m16 10 5-3v10l-5-3V10Z"/></svg>,
  'video-to-video': <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h9l3 4"/><path d="M20 20h-9l-3-4"/><path d="m14 8 4 4-4 4"/><path d="m10 16-4-4 4-4"/></svg>,
  'talking-photo': <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/><path d="M9 9c1 .5 2 .5 3 0"/></svg>,
  'lip-sync': <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="15" height="14" rx="2.5"/><path d="m17 9 5-3v12l-5-3V9Z"/><path d="M6 12h6M6 15h4"/></svg>,
  'face-swap': <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="10" r="3"/><circle cx="15" cy="10" r="3"/><path d="M4 20c0-3 2.5-5 5-5s5 2 5 5M15 15c2.5 0 5 2 5 5"/></svg>,
  subtitle: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M6 15h2M10 15h4M16 15h2"/></svg>,
  translate: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>,
  gif: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M7 11h3M7 14h3M15 11a2 2 0 1 1-2 2"/></svg>,
  animation: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M10 8v8l6-4-6-4Z"/></svg>,
  cutout: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h6v6H4z"/><path d="M14 4h6v6h-6z"/><path d="M4 14h6v6H4z"/><path d="m14 14 6 6M20 14l-6 6"/></svg>,
  upscale: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 16V8M9 11l3-3 3 3"/></svg>,
  headshot: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="10" r="3"/><path d="M6 20c0-3.5 3-5.5 6-5.5s6 2 6 5.5"/></svg>,
  colorize: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" fillOpacity="0.25"/><circle cx="12" cy="12" r="3"/></svg>,
  audio: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M8 6v12M16 6v12M4 10v4M20 10v4"/></svg>,
  library: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="6" height="16" rx="1.5"/><rect x="11" y="4" width="6" height="16" rx="1.5"/><path d="m20.5 5.5-3 15"/></svg>,
};

export default function AdminDashboard() {
  const { user, logout, token } = useAuth();
  const { activeCount } = useQueue();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMode, setActiveMode] = useState('admin');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [unreadChat, setUnreadChat] = useState(0); // NEW: live unread badge

  // Sync the active mode based on the URL
  useEffect(() => {
    if (location.pathname.startsWith('/admin/studio')) {
      setActiveMode('studio');
    } else {
      setActiveMode('admin');
    }
  }, [location.pathname]);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === 'Escape') setPaletteOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Live chat unread counter ────────────────────────
  // Lightweight socket that listens only for new guest messages
  // and bumps the sidebar badge. Actual chat UI lives in AdminChat.
  useEffect(() => {
    if (!token) return;

    // Fetch initial unread count
    fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/conversations?status=open&limit=200`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.items) return;
        const total = data.items.reduce((sum, c) => sum + (c.unreadByAdmin || 0), 0);
        setUnreadChat(total);
      })
      .catch(() => {});

    const socket = io(SOCKET_URL, {
      auth: { token, role: 'admin' },
      transports: ['websocket'],
    });

    socket.on('admin:message:new', ({ conversationId, message }) => {
      // Ignore messages if the admin is currently on the chat page —
      // AdminChat marks them read immediately, so we avoid double-counting.
      if (location.pathname === '/admin/chat') return;
      if (message.from === 'user') {
        setUnreadChat((n) => n + 1);
      }
    });

    // Reset when the admin opens a specific conversation (AdminChat emits mark-read
    // via REST; we refetch the count whenever the route changes into /admin/chat).
    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [token, location.pathname]);

  // Re-sync unread count when the chat page is entered/exited
  useEffect(() => {
    if (!token) return;
    if (location.pathname !== '/admin/chat') return;

    // Admin is inside chat — zero the badge; AdminChat handles per-conversation reads
    setUnreadChat(0);
  }, [location.pathname, token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#0e0d0c] text-white">
      {/* Ambient glows — matches user dashboard */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[20%] left-[15%] h-[640px] w-[640px] rounded-full bg-[#8b5cf6] opacity-[0.08] blur-[140px]" />
        <div className="absolute -bottom-[10%] right-[5%] h-[460px] w-[460px] rounded-full bg-[#ff6b6b] opacity-[0.05] blur-[140px]" />
      </div>

      {/* ═══════════════ TOPBAR ═══════════════ */}
      <header className="relative flex h-14 shrink-0 items-center justify-between border-b border-white/[0.05] bg-[#0e0d0c]/70 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b6b] to-[#dc2626] font-bold text-white shadow-lg shadow-red-900/40">
              A
            </div>
            <span className="text-[14px] font-semibold text-white">
              Alveoly <span className="font-serif-human italic text-[#ff6b6b]">Admin</span>
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="ml-4 flex rounded-lg border border-white/10 bg-white/5 p-0.5">
            <button
              onClick={() => navigate('/admin')}
              className={`rounded-md px-3 py-1 text-[11px] font-medium transition ${
                activeMode === 'admin' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              Admin Controls
            </button>
            <button
              onClick={() => navigate('/admin/studio/image')}
              className={`rounded-md px-3 py-1 text-[11px] font-medium transition ${
                activeMode === 'studio' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              Creator Studio (Free)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {activeCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-full border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-2.5 py-1 text-[10.5px] font-medium text-[#c4b5fd]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8b5cf6] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />
              </span>
              {activeCount} generating
            </div>
          )}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            <span className="text-[11px] font-medium text-white/70">Admin Mode</span>
          </div>
          <button onClick={handleLogout} className="text-[12px] font-medium text-red-400 transition hover:text-red-300">
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ═══════════════ SIDEBAR ═══════════════ */}
        <aside className="flex w-64 shrink-0 flex-col border-r border-white/[0.05] bg-[#0e0d0c]/40">
          <nav className="min-h-0 flex-1 overflow-y-auto p-4">
            {activeMode === 'admin' ? (
              <>
                <p className="mb-2 px-3 text-[9.5px] font-semibold uppercase tracking-[0.15em] text-white/25">
                  Management
                </p>
                <div className="space-y-1">
                  {ADMIN_NAV.map((item) => {
                    const showBadge =
                      item.badgeKey === 'chat' && unreadChat > 0 && location.pathname !== '/admin/chat';
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.exact}
                        className={({ isActive }) =>
                          `flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${
                            isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'
                          }`
                        }
                      >
                        <span className="flex items-center gap-3">
                          {ICONS[item.icon]}
                          {item.label}
                        </span>
                        {showBadge && (
                          <span className="rounded-full bg-[#ff6b6b] px-1.5 py-0.5 text-[9px] font-bold text-white">
                            {unreadChat > 99 ? '99+' : unreadChat}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <p className="mb-2 px-3 text-[9.5px] font-semibold uppercase tracking-[0.15em] text-white/25">
                  Creator Studio
                </p>
                <div className="space-y-1">
                  {STUDIO_NAV.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200 ${
                          isActive ? 'bg-white/[0.06] text-white' : 'text-white/55 hover:bg-white/[0.03] hover:text-white/90'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span
                              className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full"
                              style={{ background: item.accent }}
                            />
                          )}
                          <span style={{ color: isActive ? item.accent : 'currentColor' }}>
                            {ICONS[item.icon]}
                          </span>
                          <p className="text-[13px] font-medium leading-tight">{item.label}</p>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </>
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="shrink-0 border-t border-white/[0.05] p-4">
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
              <p className="text-[11px] font-medium text-red-300">Unlimited Access</p>
              <p className="mt-1 text-[10px] leading-4 text-red-400/60">
                As an admin, you can generate anything for free. No credits will be deducted.
              </p>
            </div>
          </div>
        </aside>

        {/* ═══════════════ MAIN CONTENT ═══════════════ */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px] px-6 py-6">
            <Routes>
              {/* Admin Routes */}
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="chat" element={<AdminChat />} /> {/* NEW */}
              <Route path="settings" element={<AdminSettings />} />

              {/* Studio Routes (Admin gets these for free) */}
              <Route path="studio/image" element={<ImageGenerator key="image" />} />
              <Route path="studio/image-edit" element={<ImageEditorGenerator key="image-edit" />} />
              <Route path="studio/video" element={<VideoGenerator key="video" />} />
              <Route path="studio/image-to-video" element={<ImageToVideoGenerator key="image-to-video" />} />
              <Route path="studio/video-to-video" element={<VideoToVideoGenerator key="video-to-video" />} />
              <Route path="studio/talking-photo" element={<TalkingPhotoGenerator key="talking-photo" />} />
              <Route path="studio/lip-sync" element={<LipSyncGenerator key="lip-sync" />} />
              <Route path="studio/face-swap" element={<FaceSwapGenerator key="face-swap" />} />
              <Route path="studio/subtitle" element={<SubtitleGenerator key="subtitle" />} />
              <Route path="studio/translate" element={<TranslatorGenerator key="translate" />} />
              <Route path="studio/gif" element={<GifGenerator key="gif" />} />
              <Route path="studio/animation" element={<AnimationGenerator key="animation" />} />
              <Route path="studio/background-removal" element={<BackgroundRemover key="background-removal" />} />
              <Route path="studio/upscale" element={<UpscaleGenerator key="upscale" />} />
              <Route path="studio/headshot" element={<HeadshotGenerator key="headshot" />} />
              <Route path="studio/colorize" element={<PhotoColorizerGenerator key="colorize" />} />
              <Route path="studio/audio" element={<AudioGenerator key="audio" />} />
              <Route path="studio/library" element={<Library key="library" />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Floating Queue & Command Palette */}
      <QueueDrawer />
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </div>
  );
}