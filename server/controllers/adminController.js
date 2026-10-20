import User from '../models/User.js';
import Asset from '../models/Asset.js';
import Setting from '../models/Setting.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

// ── 1. DASHBOARD STATS ──
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAssets = await Asset.countDocuments();
    
    // Calculate revenue from successful transactions
    const transactions = await Transaction.find({ status: 'success' });
    const totalRevenue = transactions.reduce((acc, tx) => acc + tx.amountUSD, 0);
    
    // Assets generated today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const assetsToday = await Asset.countDocuments({ createdAt: { $gte: startOfDay } });

    res.json({ totalUsers, totalAssets, assetsToday, totalRevenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── 2. USER MANAGEMENT ──
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
      
    const total = await User.countDocuments();
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    res.json({ message: 'Role updated', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();
    res.json({ message: `User ${user.status}`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    // Also delete their assets (optional but recommended)
    await Asset.deleteMany({ userId: id });
    res.json({ message: 'User and assets deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUserCredits = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.credits = Math.max(0, user.credits + amount);
    await user.save();
    res.json({ message: 'Credits updated', credits: user.credits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── 3. PAYMENTS & REVENUE ──
export const getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ status: 'success' })
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
      
    const total = await Transaction.countDocuments({ status: 'success' });
    res.json({ transactions, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── 4. SETTINGS (Pricing & Tokens) ──
export const getSettings = async (req, res) => {
  try {
    const settings = await Setting.find().lean();
    const settingsObj = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    const updated = await Setting.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── 5. NOTIFICATIONS ──
export const sendNotification = async (req, res) => {
  try {
    const { title, message, type, targetEmail } = req.body;
    let userId = null;

    if (targetEmail) {
      const user = await User.findOne({ email: targetEmail });
      if (!user) return res.status(404).json({ error: 'User not found' });
      userId = user._id;
    }

    await Notification.create({ userId, title, message, type });
    res.json({ message: 'Notification sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};