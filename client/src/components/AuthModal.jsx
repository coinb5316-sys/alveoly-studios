// components/AuthModal.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AUTH_ARTWORK = {
  login: [
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1100&q=90',
    'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1100&q=90',
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1100&q=90',
    'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1100&q=90',
  ],
  register: [
    'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1100&q=90',
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1100&q=90',
    'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1100&q=90',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1100&q=90',
  ],
  forgot: [
    'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1100&q=90',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1100&q=90',
    'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1100&q=90',
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1100&q=90',
  ],
};

const AuthModal = ({ mode, onSwitchMode, onClose }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [slide, setSlide] = useState(0);

  const hasProcessedOAuth = useRef(false);
  const onCloseRef = useRef(onClose);
  const loginRef = useRef(login);
  const navigateRef = useRef(navigate);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    loginRef.current = login;
  }, [login]);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  const safeClose = useCallback(() => {
    if (typeof onCloseRef.current === 'function') {
      try {
        onCloseRef.current();
      } catch (e) {
        console.error('onClose threw:', e);
      }
    }
  }, []);

  const safeLogin = useCallback((user, token) => {
    if (typeof loginRef.current !== 'function') {
      console.error('login is not a function in AuthModal:', loginRef.current);
      throw new Error('Authentication service unavailable. Please refresh the page.');
    }
    return loginRef.current(user, token);
  }, []);

  const safeNavigate = useCallback((path, opts) => {
    if (typeof navigateRef.current !== 'function') {
      console.error('navigate is not a function in AuthModal:', navigateRef.current);
      return;
    }
    return navigateRef.current(path, opts);
  }, []);

  const resolveRedirect = useCallback(() => {
    const redirect = searchParams.get('redirect');
    return redirect || '/dashboard';
  }, [searchParams]);

  const slides =
    mode === 'login'
      ? AUTH_ARTWORK.login
      : mode === 'register'
        ? AUTH_ARTWORK.register
        : AUTH_ARTWORK.forgot;

  // ── Google OAuth redirect handler ──────────────────────────
  useEffect(() => {
    if (hasProcessedOAuth.current) return;

    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');
    const credits = searchParams.get('credits');
    const role = searchParams.get('role');
    const errParam = searchParams.get('error');

    if (errParam) {
      hasProcessedOAuth.current = true;
      setError('Google authentication failed. Please try again.');
      return;
    }

    if (token && emailParam) {
      hasProcessedOAuth.current = true;
      const userData = {
        email: emailParam,
        credits: Number(credits) || 0,
        role: role || 'user',
      };
      try {
        safeLogin(userData, token);
        safeClose();
        safeNavigate(resolveRedirect(), { replace: true });
      } catch (e) {
        setError(e.message || 'Google login failed. Please try again.');
      }
    }
  }, [searchParams, safeClose, safeLogin, safeNavigate, resolveRedirect]);

  // Auto-advance the slider
  useEffect(() => {
    if (!slides.length) return undefined;
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    setSlide(0);
  }, [mode]);

  useEffect(() => {
    setStep('email');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setError('');
    setNotice('');
  }, [mode]);

  useEffect(() => {
    const scroller = document.querySelector('.page-scroll');
    if (!scroller) return undefined;
    const original = scroller.style.overflow;
    scroller.style.overflow = 'hidden';
    return () => {
      scroller.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') safeClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [safeClose]);

  const resetMessages = () => {
    setError('');
    setNotice('');
  };

  const handleEmailContinue = (event) => {
    event.preventDefault();
    resetMessages();

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address to continue.');
      return;
    }

    setEmail(normalizedEmail);
    setStep('password');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetMessages();

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, {
        email: email.trim().toLowerCase(),
        password,
      });

      if (!res.data?.user || !res.data?.token) {
        throw new Error('The server response was incomplete. Please try again.');
      }

      safeLogin(res.data.user, res.data.token);
      safeClose();
      safeNavigate(resolveRedirect(), { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (event) => {
    event.preventDefault();
    resetMessages();

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address to continue.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: normalizedEmail });
      setEmail(normalizedEmail);
      setStep('forgot-sent');
      setNotice(
        'If an account exists for this email, a reset link has been sent. Please check your inbox.'
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'We could not process that request. Please try again in a moment.'
      );
    } finally {
      setLoading(false);
    }
  };

  const switchToLogin = () => onSwitchMode('login');
  const switchToRegister = () => onSwitchMode('register');
  const openForgot = () => onSwitchMode('forgot');

  /**
   * Start Google OAuth.
   * Passes the current `?redirect=` value as `?redirect=` on the backend
   * start URL so it survives the round-trip to Google and back.
   */
  const handleGoogleClick = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    const route = mode === 'register' ? '/auth/google/register' : '/auth/google';
    const redirect = searchParams.get('redirect') || '';
    const qs = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
    window.location.assign(`${baseUrl}${route}${qs}`);
  };

  const heading =
    mode === 'login'
      ? 'Welcome back'
      : mode === 'register'
        ? 'Create a free account to generate'
        : step === 'forgot-sent'
          ? 'Check your inbox'
          : 'Reset your password';

  const subheading =
    mode === 'login'
      ? 'Log in to your account to continue.'
      : mode === 'register'
        ? 'Used by creators to bring ideas to life. No credit card required.'
        : step === 'forgot-sent'
          ? 'We sent a reset link to the address below.'
          : 'Enter the email on your account and we will send you a reset link.';

  return (
    <div
      className="alveoly-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={heading}
      onClick={(e) => {
        if (e.target === e.currentTarget) safeClose();
      }}
    >
      <style>{`
        .alveoly-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: rgba(5, 4, 10, 0.72);
          backdrop-filter: blur(14px) saturate(120%);
          -webkit-backdrop-filter: blur(14px) saturate(120%);
          overflow-y: auto;
          animation: alveoly-modal-fade .18s ease-out;
        }
        @keyframes alveoly-modal-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .alveoly-modal-panel {
          position: relative;
          width: min(100%, 860px);
          height: 560px;
          min-height: 560px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, .9fr);
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 18px;
          background: rgba(18, 15, 30, .98);
          box-shadow:
            0 40px 120px rgba(0,0,0,.6),
            0 0 90px rgba(124,58,237,.18),
            0 0 0 1px rgba(255,255,255,.04) inset;
          animation: alveoly-modal-pop .22s ease-out;
        }
        @keyframes alveoly-modal-pop {
          from { opacity: 0; transform: translateY(10px) scale(.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        .alveoly-modal-form {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(28px, 4vw, 52px);
          height: 100%;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #4c3a7a transparent;
        }
        .alveoly-modal-form::-webkit-scrollbar { width: 6px; }
        .alveoly-modal-form::-webkit-scrollbar-track { background: transparent; }
        .alveoly-modal-form::-webkit-scrollbar-thumb {
          background: #4c3a7a;
          border-radius: 3px;
        }
        .alveoly-modal-art {
          position: relative;
          height: 100%;
          overflow: hidden;
          background: #2a1747;
        }
        .alveoly-modal-art img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          opacity: 0;
          transition: opacity .8s ease-in-out;
        }
        .alveoly-modal-art img.is-active { opacity: 1; }
        .alveoly-modal-art::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(10,7,18,.03), rgba(10,7,18,.2)),
                      linear-gradient(90deg, rgba(18,15,30,.18), transparent 38%);
          pointer-events: none;
          z-index: 1;
        }
        .alveoly-modal-close {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 20;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          color: rgba(255,255,255,.7);
          transition: background .18s, color .18s, transform .18s;
        }
        .alveoly-modal-close:hover { background: rgba(255,255,255,.14); color: #fff; }
        .alveoly-modal-close:active { transform: scale(.95); }
        .alveoly-modal-input {
          width: 100%;
          min-height: 44px;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 9px;
          background: #211d2d;
          padding: 11px 13px;
          color: #fff;
          font-size: 12px;
          outline: none;
          transition: border-color .18s, box-shadow .18s;
        }
        .alveoly-modal-input::placeholder { color: #8f899e; }
        .alveoly-modal-input:focus {
          border-color: rgba(139,92,246,.85);
          box-shadow: 0 0 0 3px rgba(139,92,246,.12);
        }
        .alveoly-modal-primary {
          min-height: 43px;
          border-radius: 9px;
          background: linear-gradient(100deg, #6d28d9, #5b21f5);
          color: white;
          font-size: 12px;
          font-weight: 650;
          box-shadow: 0 7px 22px rgba(91,33,245,.2);
          transition: filter .18s, transform .18s;
        }
        .alveoly-modal-primary:hover { filter: brightness(1.12); }
        .alveoly-modal-primary:active { transform: translateY(1px); }
        .alveoly-modal-google {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: 100%;
          min-height: 42px;
          border-radius: 9px;
          background: #fff;
          color: #27232d;
          font-size: 12px;
          font-weight: 600;
          transition: background .18s;
        }
        .alveoly-modal-google:hover { background: #f2eff7; }

        @media (max-width: 860px) {
          .alveoly-modal-panel { height: 520px; min-height: 520px; }
        }

        @media (max-width: 640px) {
          .alveoly-modal-backdrop {
            padding: 0;
            align-items: flex-start;
          }
          .alveoly-modal-panel {
            width: 100%;
            max-width: 430px;
            height: auto;
            min-height: auto;
            max-height: none;
            grid-template-columns: 1fr;
            margin: 24px auto 60px;
            border-radius: 16px;
          }
          .alveoly-modal-form {
            padding: 30px 24px 28px;
            height: auto;
            overflow-y: visible;
            order: 2;
          }
          .alveoly-modal-art {
            height: 180px;
            min-height: 180px;
            order: 1;
          }
          .alveoly-modal-art img { object-position: center 42%; }
          .alveoly-modal-art .alveoly-caption { display: none; }
          .alveoly-modal-close { top: 10px; right: 10px; }
        }

        @media (max-width: 380px) {
          .alveoly-modal-form { padding: 24px 18px 22px; }
          .alveoly-modal-art { height: 150px; min-height: 150px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .alveoly-modal-backdrop,
          .alveoly-modal-panel { animation: none !important; }
          .alveoly-modal-art img { transition: none !important; }
        }
      `}</style>

      <section className="alveoly-modal-panel">
        <button
          type="button"
          onClick={safeClose}
          aria-label="Close"
          className="alveoly-modal-close"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="alveoly-modal-form">
          <div className="mb-7 text-center">
            <h1 className="mb-2 text-[21px] font-semibold leading-tight tracking-[-.025em] text-white">
              {heading}
            </h1>
            <p className="text-[11px] leading-5 text-white/45">{subheading}</p>
          </div>

          {error && (
            <div role="alert" className="mb-4 rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2.5 text-xs leading-5 text-red-200">
              {error}
            </div>
          )}
          {notice && (
            <div role="status" className="mb-4 rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-2.5 text-xs leading-5 text-violet-100">
              {notice}
            </div>
          )}

          {mode !== 'forgot' && (
            <>
              <button type="button" onClick={handleGoogleClick} className="alveoly-modal-google">
                <svg aria-hidden="true" viewBox="0 0 48 48" className="h-4 w-4">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(4 4) scale(.83)"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 38.02 46.98 31.8 46.98 24.55Z" transform="translate(2 2) scale(.9)"/>
                  <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z" transform="translate(5 4) scale(.83)"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 43.62 14.62 48 24 48Z" transform="translate(4 1) scale(.83)"/>
                </svg>
                Continue with Google
              </button>

              <div className="my-5 flex items-center gap-3 text-[10px] text-white/35">
                <span className="h-px flex-1 bg-white/[.09]" />
                <span>OR</span>
                <span className="h-px flex-1 bg-white/[.09]" />
              </div>
            </>
          )}

          <div>
            {mode === 'forgot' ? (
              step === 'forgot-sent' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[.08] bg-white/[.025] px-3 py-2.5">
                    <span className="min-w-0 truncate text-xs text-white/75">{email}</span>
                  </div>
                  <button type="button" onClick={switchToLogin} className="alveoly-modal-primary w-full">
                    Back to log in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('forgot-email');
                      setEmail('');
                      resetMessages();
                    }}
                    className="w-full py-1 text-[11px] text-white/45 transition hover:text-white/75"
                  >
                    Use a different email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <label className="sr-only" htmlFor="forgot-email">Email address</label>
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your account email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error || notice) resetMessages();
                    }}
                    className="alveoly-modal-input"
                    required
                    autoFocus
                  />
                  <button type="submit" disabled={loading} className="alveoly-modal-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
                    {loading ? 'Sending…' : 'Send reset link'}
                  </button>
                  <button
                    type="button"
                    onClick={switchToLogin}
                    className="w-full py-1 text-[11px] text-white/45 transition hover:text-white/75"
                  >
                    Back to log in
                  </button>
                </form>
              )
            ) : step === 'email' ? (
              <form onSubmit={handleEmailContinue} className="space-y-3">
                <label className="sr-only" htmlFor="auth-email">Email address</label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error || notice) resetMessages();
                  }}
                  className="alveoly-modal-input"
                  required
                  autoFocus
                />
                <button type="submit" className="alveoly-modal-primary w-full">
                  Continue
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[.08] bg-white/[.025] px-3 py-2.5">
                  <span className="min-w-0 truncate text-xs text-white/75">{email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setPassword('');
                      resetMessages();
                    }}
                    className="shrink-0 text-[11px] font-medium text-violet-300 hover:text-violet-200"
                  >
                    Change
                  </button>
                </div>
                <label className="sr-only" htmlFor="auth-password">Password</label>
                <div className="relative">
                  <input
                    id="auth-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (error || notice) resetMessages();
                    }}
                    className="alveoly-modal-input pr-16"
                    minLength={mode === 'register' ? 8 : undefined}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-3 text-[10px] font-medium text-white/45 hover:text-white/80"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {mode === 'register' && (
                  <p className="text-[10px] leading-4 text-white/40">Use at least 8 characters for your password.</p>
                )}

                {mode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={openForgot}
                      className="text-[11px] font-medium text-violet-300 hover:text-violet-200"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button type="submit" disabled={loading} className="alveoly-modal-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setPassword('');
                    resetMessages();
                  }}
                  className="w-full py-1 text-[11px] text-white/45 transition hover:text-white/75"
                >
                  Use a different email
                </button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-[10px] leading-5 text-white/40">
            By {mode === 'login' ? 'logging in' : mode === 'register' ? 'registering' : 'continuing'}, you agree to Alveoly Studios&apos;{' '}
            <Link to="/terms" className="text-violet-300 underline underline-offset-2 hover:text-violet-200">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-violet-300 underline underline-offset-2 hover:text-violet-200">Privacy Policy</Link>.
          </p>

          <p className="mt-5 text-center text-[11px] text-white/55">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button type="button" onClick={switchToRegister} className="font-semibold text-violet-300 transition hover:text-violet-200">
                  Sign up
                </button>
              </>
            ) : mode === 'register' ? (
              <>
                Already have an account?{' '}
                <button type="button" onClick={switchToLogin} className="font-semibold text-violet-300 transition hover:text-violet-200">
                  Log in
                </button>
              </>
            ) : (
              <>
                Remembered it?{' '}
                <button type="button" onClick={switchToLogin} className="font-semibold text-violet-300 transition hover:text-violet-200">
                  Back to log in
                </button>
              </>
            )}
          </p>
        </div>

        <div className="alveoly-modal-art" aria-label="Creative artwork">
          {slides.map((src, index) => (
            <img
              key={src}
              src={src}
              alt=""
              className={index === slide ? 'is-active' : ''}
            />
          ))}

          <div className="absolute top-4 left-4 z-10 flex gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: index === slide ? '22px' : '6px',
                  background: index === slide ? '#fff' : 'rgba(255,255,255,.35)',
                }}
              />
            ))}
          </div>

          <div className="alveoly-caption absolute bottom-5 left-5 right-5 z-10 rounded-xl border border-white/15 bg-black/25 p-3 backdrop-blur-md">
            <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-white/60">Alveoly Studios</p>
            <p className="mt-1 text-xs font-medium text-white/90">
              {mode === 'login'
                ? 'Welcome back to your creative space.'
                : mode === 'register'
                  ? 'Your next idea starts here.'
                  : 'We will help you get back in.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuthModal;