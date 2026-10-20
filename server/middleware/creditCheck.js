import User from '../models/User.js';
import Setting from '../models/Setting.js';

export const requireCredits = (toolKey) => async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Admins bypass all credit checks
    if (user.role === 'admin') {
      req.toolCost = 0;
      return next();
    }

    // Fetch the tool cost from DB (defaults to 10 if not set)
    const setting = await Setting.findOne({ key: toolKey });
    const cost = setting ? Number(setting.value) : 10;

    if (user.credits < cost) {
      return res.status(402).json({ 
        error: `Insufficient credits. This tool costs ${cost} credits. Please upgrade.` 
      });
    }

    req.toolCost = cost;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Error checking credits' });
  }
};