// server.js
import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import passport from 'passport';
import connectDB from './config/db.js';
import { configurePassport } from './config/passport.js';
import { initSocket } from './socket/index.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import generationRoutes from './routes/generationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import uploadRoutes from './routes/upload.js';
import assetRoutes from './routes/assetRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

// Controllers
import { googleAuthCallback } from './controllers/authController.js';

const app = express();

// Required on Render: trust the reverse proxy so req.ip / secure cookies work
app.set('trust proxy', 1);

connectDB();
app.use(passport.initialize());
configurePassport(passport);

// ── CORS ────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://alveolystudios.site',
  'https://www.alveolystudios.site',
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    // Allow curl / server-to-server (no Origin header)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── Google OAuth (login) ────────────────────────────
app.get(
  '/auth/google',
  passport.authenticate('google-login', { scope: ['profile', 'email'] })
);
app.get(
  '/auth/google/callback',
  passport.authenticate('google-login', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=GoogleAuthFailed`,
  }),
  googleAuthCallback
);

// ── Google OAuth (register) ─────────────────────────
app.get(
  '/auth/google/register',
  passport.authenticate('google-register', { scope: ['profile', 'email'] })
);
app.get(
  '/auth/google/register/callback',
  passport.authenticate('google-register', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=GoogleAuthFailed`,
  }),
  googleAuthCallback
);

// ── Health & root ───────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now(), service: 'Alveoly Studios Engine' });
});

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'Alveoly Studios Engine' });
});

// ── API routes ──────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/generate', generationRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// ── 404 catch-all (must come before error handler) ──
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});

// ── Global error handler ────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Global error:', err.message);
  if (err.message?.startsWith('CORS blocked')) {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: 'Something went wrong' });
});

// ── HTTP server + Socket.IO ─────────────────────────
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Engine running on port ${PORT}`);
  console.log(`🔌 Socket.IO listening on ws://localhost:${PORT}`);
});