import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueueProvider } from './context/QueueContext';

// Public pages
import Landing from './pages/Landing';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import PricingConfirm from './pages/PricingConfirm';
import FAQ from './pages/FAQ';
import Showcase from './pages/Showcase';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import About from './pages/About';
import Contact from './pages/Contact';

// Protected pages
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

// Global auth modal
import AuthModal from './components/AuthModal';

/* ─────────────────────────────────────────────
   ProtectedRoute — same behavior as before
   ───────────────────────────────────────────── */
function ProtectedRoute({ children }) {
  const { ready, isAuthenticated } = useAuth();

  if (!ready) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0e0d0c]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-[#a78bfa]" />
          <p className="text-[11px] text-white/40">Restoring session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/* ─────────────────────────────────────────────
   AuthShell — handles the login/register/forgot modal
   and preserves the ?redirect= param through login.
   ───────────────────────────────────────────── */
function AuthShell({ children }) {
  const [authMode, setAuthMode] = useState(null); // 'login' | 'register' | 'forgot' | null
  const location = useLocation();
  const navigate = useNavigate();

  // Sync modal with the current URL
  useEffect(() => {
    if (location.pathname === '/login') setAuthMode('login');
    else if (location.pathname === '/register') setAuthMode('register');
    else if (location.pathname === '/forgot-password') setAuthMode('forgot');
    else setAuthMode(null);
  }, [location.pathname]);

  // Listen for global `auth:open` events (from Navbar, CTAs, etc.)
  useEffect(() => {
    const handler = (e) => {
      const mode = e.detail || 'login';
      const search = window.location.search; // preserve ?redirect=… if any
      setAuthMode(mode);
      if (mode === 'login') navigate(`/login${search}`);
      else if (mode === 'register') navigate(`/register${search}`);
      else if (mode === 'forgot') navigate(`/forgot-password${search}`);
    };
    window.addEventListener('auth:open', handler);
    return () => window.removeEventListener('auth:open', handler);
  }, [navigate]);

  const closeAuth = () => {
    setAuthMode(null);
    // Only navigate when we were on an auth route
    if (['/login', '/register', '/forgot-password'].includes(location.pathname)) {
      // If there's a redirect target, honor it even on close
      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect');
      if (redirect) {
        navigate(redirect, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  };

  const switchAuthMode = (nextMode) => {
    setAuthMode(nextMode);
    // Preserve ?redirect=… when switching between login / register / forgot
    const search = location.search;
    if (nextMode === 'login') navigate(`/login${search}`);
    else if (nextMode === 'register') navigate(`/register${search}`);
    else if (nextMode === 'forgot') navigate(`/forgot-password${search}`);
  };

  return (
    <>
      {children}
      {authMode && (
        <AuthModal
          mode={authMode}
          onSwitchMode={switchAuthMode}
          onClose={closeAuth}
        />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   App
   ───────────────────────────────────────────── */
function App() {
  return (
    <AuthProvider>
      <QueueProvider>
        <BrowserRouter>
          <AuthShell>
            <Routes>
              {/* ── Public marketing pages ── */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Landing />} />
              <Route path="/register" element={<Landing />} />
              <Route path="/forgot-password" element={<Landing />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/pricing/confirm" element={<PricingConfirm />} /> {/* NEW */}
              <Route path="/faq" element={<FAQ />} />
              <Route path="/showcase" element={<Showcase />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />

              {/* ── Authenticated user dashboard ── */}
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* ── Authenticated admin dashboard ── */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* ── Fallback ── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthShell>
        </BrowserRouter>
      </QueueProvider>
    </AuthProvider>
  );
}

export default App;