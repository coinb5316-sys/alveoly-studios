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
import chatRoutes from './routes/chatRoutes.js'; // NEW

// Controllers
import { googleAuthCallback } from './controllers/authController.js';

const app = express();
connectDB();
app.use(passport.initialize());
configurePassport(passport);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Google OAuth
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=GoogleAuthFailed' }),
  googleAuthCallback
);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Alveoly Studios Engine' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/generate', generationRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes); // NEW

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
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