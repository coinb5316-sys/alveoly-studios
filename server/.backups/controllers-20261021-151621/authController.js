// controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed });

    res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, email: user.email, credits: user.credits, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    res.json({
      token: generateToken(user._id),
      user: { id: user._id, email: user.email, credits: user.credits, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

/**
 * Google OAuth callback.
 * `req.user` is set by Passport's Google strategy.
 * `req.query.state` carries the `redirect` value we passed to the
 * /auth/google start endpoint (Google echoes it back verbatim).
 */
export const googleAuthCallback = (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  try {
    const { _id, email, credits, role } = req.user;
    const token = generateToken(_id);

    // Redirect target that survived the OAuth round-trip
    const redirect = req.query.state || '';

    const params = new URLSearchParams({
      token,
      email: email || '',
      credits: String(credits ?? 0),
      role: role || 'user',
    });
    if (redirect) params.set('redirect', redirect);

    res.redirect(`${frontendUrl}/login?${params.toString()}`);
  } catch (err) {
    console.error('Google callback error:', err);
    res.redirect(`${frontendUrl}/login?error=GoogleAuthFailed`);
  }
};