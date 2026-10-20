// middleware/adminAuth.js
import User from '../models/User.js';

export const adminProtect = async (req, res, next) => {
  try {
    // req.user is set by the `protect` middleware from the JWT payload.
    // Depending on how your JWT was signed, the id can be at `id`, `userId`,
    // or `_id`. Try all three so this works regardless of the sign pattern.
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'No user id in token' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    // Attach the full user doc so downstream handlers (e.g. adminReply)
    // can access `req.userDoc._id` for audit trails instead of guessing
    // at the JWT payload shape.
    req.userDoc = user;

    next();
  } catch (err) {
    console.error('[adminProtect]', err);
    res.status(500).json({ error: 'Server error in admin verification' });
  }
};