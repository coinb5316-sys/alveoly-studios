import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';

const NAV_LINKS = [
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/showcase', label: 'Showcase' },
  { to: '/faq', label: 'FAQ' },
];

function Brand({ onDark }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 font-semibold tracking-tight transition hover:opacity-90 ${
        onDark ? 'text-white' : 'text-[#1a1a1a]'
      }`}
      aria-label="Alveoly Studios home"
    >
      <img src={logo} alt="" className="h-7 w-7 shrink-0 rounded-lg object-contain" />
      <span className="text-[15.5px] sm:text-[16px]">Alveoly Studios</span>
    </Link>
  );
}

export default function Navbar({ scrolled, openLogin, openRegister }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isLanding = location.pathname === '/';
  const solid = scrolled || !isLanding;
  const onDark = !solid;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Safe openers — fall back to a global event if parent forgot to pass them
  const safeOpen = (mode, prop) => {
    if (typeof prop === 'function') return prop();
    window.dispatchEvent(new CustomEvent('auth:open', { detail: mode }));
  };
  const handleLoginClick = () => safeOpen('login', openLogin);
  const handleRegisterClick = () => safeOpen('register', openRegister);
  const handleMobileLogin = () => {
    setMobileOpen(false);
    handleLoginClick();
  };
  const handleMobileRegister = () => {
    setMobileOpen(false);
    handleRegisterClick();
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? 'border-b border-black/[0.06] bg-[#fdfbf7]/90 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8">
        <Brand onDark={onDark} />

        <nav className="hidden items-center gap-1 text-[13px] lg:flex">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-lg px-3.5 py-2 font-medium transition ${
                  onDark
                    ? `text-white/80 hover:bg-white/10 hover:text-white ${isActive ? 'text-white' : ''}`
                    : `text-[#4a4a4a] hover:bg-black/[0.04] hover:text-[#1a1a1a] ${isActive ? 'text-[#1a1a1a]' : ''}`
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={handleLoginClick}
            className={`rounded-lg px-3.5 py-2 text-[13px] font-medium transition ${
              onDark
                ? 'text-white/85 hover:bg-white/10 hover:text-white'
                : 'text-[#4a4a4a] hover:bg-black/[0.04] hover:text-[#1a1a1a]'
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={handleRegisterClick}
            className={`rounded-lg px-4 py-2.5 text-[13px] font-semibold transition ${
              onDark
                ? 'bg-white text-[#1a1a1a] hover:bg-white/90'
                : 'bg-[#1a1a1a] text-white hover:bg-[#2b2b2b]'
            }`}
          >
            Sign up free
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg transition sm:hidden ${
            onDark ? 'text-white hover:bg-white/10' : 'text-[#1a1a1a] hover:bg-black/[0.04]'
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      <div
        className={`sm:hidden overflow-hidden border-t border-black/[0.06] bg-[#fdfbf7] transition-[max-height,opacity] duration-300 ${
          mobileOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 py-4">
          <nav className="flex flex-col">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-[14px] font-medium transition ${
                    isActive
                      ? 'bg-black/[0.04] text-[#1a1a1a]'
                      : 'text-[#4a4a4a] hover:bg-black/[0.04] hover:text-[#1a1a1a]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-black/[0.06] pt-4">
            <button
              type="button"
              onClick={handleMobileLogin}
              className="rounded-lg border border-black/10 px-4 py-2.5 text-[13px] font-medium text-[#1a1a1a] transition hover:bg-black/[0.04]"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={handleMobileRegister}
              className="rounded-lg bg-[#1a1a1a] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#2b2b2b]"
            >
              Sign up free
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}