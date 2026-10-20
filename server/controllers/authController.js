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

// Add this to the bottom of your existing authController.js
export const googleAuthCallback = (req, res) => {
  try {
    // req.user is set by the Passport Google Strategy
    const { _id, email, credits, role } = req.user;
    const token = generateToken(_id);

    // Redirect back to the frontend with the token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // We pass the user data as query params so the frontend can hydrate AuthContext
    res.redirect(
      `${frontendUrl}/login?token=${token}&email=${encodeURIComponent(email)}&credits=${credits}&role=${role}`
    );
  } catch (err) {
    console.error('Google callback error:', err);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=GoogleAuthFailed`);
  }
};
