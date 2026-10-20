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

function ProtectedRoute({ children }) {
  const { ready, isAuthenticated } = useAuth();

  if (!ready) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#06060a]">
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

function AuthShell({ children }) {
  const [authMode, setAuthMode] = useState(null); // 'login' | 'register' | 'forgot' | null
  const location = useLocation();
  const navigate = useNavigate();

  // Sync modal with URL
  useEffect(() => {
    if (location.pathname === '/login') setAuthMode('login');
    else if (location.pathname === '/register') setAuthMode('register');
    else if (location.pathname === '/forgot-password') setAuthMode('forgot');
    else setAuthMode(null);
  }, [location.pathname]);

  // Listen for `auth:open` events dispatched from anywhere (Navbar, CTAs, etc.)
  useEffect(() => {
    const handler = (e) => {
      const mode = e.detail || 'login';
      setAuthMode(mode);
      if (mode === 'login') navigate('/login');
      else if (mode === 'register') navigate('/register');
      else if (mode === 'forgot') navigate('/forgot-password');
    };
    window.addEventListener('auth:open', handler);
    return () => window.removeEventListener('auth:open', handler);
  }, [navigate]);

  const closeAuth = () => {
    setAuthMode(null);
    // Only navigate away if we were on one of the auth URLs
    if (['/login', '/register', '/forgot-password'].includes(location.pathname)) {
      navigate('/');
    }
  };

  const switchAuthMode = (nextMode) => {
    setAuthMode(nextMode);
    if (nextMode === 'login') navigate('/login');
    else if (nextMode === 'register') navigate('/register');
    else if (nextMode === 'forgot') navigate('/forgot-password');
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