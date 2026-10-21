// controllers/adminController.js
import User from '../models/User.js';
import Asset from '../models/Asset.js';
import Setting from '../models/Setting.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import { getMagicHourAccountBalance } from '../services/magicHourAccount.js';

const DEFAULT_PLANS = {
  free: { monthlyUSD: 0, yearlyUSD: 0, credits: 5 },
  pro: { monthlyUSD: 19, yearlyUSD: 15, credits: 500 },
  enterprise: { monthlyUSD: 99, yearlyUSD: 79, credits: 5000 },
};

// ── 1. DASHBOARD STATS ──
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAssets = await Asset.countDocuments();

    const transactions = await Transaction.find({ status: 'success' });
    const totalRevenue = transactions.reduce((acc, tx) => acc + tx.amountUSD, 0);

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

    if (!settingsObj.plans) {
      settingsObj.plans = DEFAULT_PLANS;
    }

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

export const savePlans = async (req, res) => {
  try {
    const incoming = req.body?.plans;
    if (!incoming || typeof incoming !== 'object') {
      return res.status(400).json({ error: 'plans object is required' });
    }

    const merged = { free: DEFAULT_PLANS.free };

    for (const id of ['pro', 'enterprise']) {
      const p = incoming[id];
      if (!p) continue;

      const monthlyUSD = Number(p.monthlyUSD);
      const yearlyUSD = Number(p.yearlyUSD);
      const credits = Number(p.credits);

      if (!Number.isFinite(monthlyUSD) || monthlyUSD < 0) {
        return res.status(400).json({ error: `${id}.monthlyUSD must be a positive number` });
      }
      if (!Number.isFinite(yearlyUSD) || yearlyUSD < 0) {
        return res.status(400).json({ error: `${id}.yearlyUSD must be a positive number` });
      }
      if (!Number.isFinite(credits) || credits < 0) {
        return res.status(400).json({ error: `${id}.credits must be a positive number` });
      }

      merged[id] = { monthlyUSD, yearlyUSD, credits };
    }

    const updated = await Setting.findOneAndUpdate(
      { key: 'plans' },
      { value: merged },
      { upsert: true, new: true }
    );

    res.json({ message: 'Plans saved', plans: updated.value });
  } catch (err) {
    console.error('[savePlans]', err);
    res.status(500).json({ error: err.message });
  }
};

export const deletePlanPrice = async (req, res) => {
  try {
    const { id } = req.params;
    if (!['pro', 'enterprise', 'free'].includes(id)) {
      return res.status(400).json({ error: 'Unknown plan id' });
    }

    const setting = await Setting.findOne({ key: 'plans' });
    const plans = setting?.value || DEFAULT_PLANS;

    plans[id] = DEFAULT_PLANS[id];

    const updated = await Setting.findOneAndUpdate(
      { key: 'plans' },
      { value: plans },
      { upsert: true, new: true }
    );

    res.json({ message: `${id} price reset to default`, plans: updated.value });
  } catch (err) {
    console.error('[deletePlanPrice]', err);
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

// ── 6. MAGIC HOUR MONITORING ──
export const getMagicHourBalance = async (req, res) => {
  try {
    const account = await getMagicHourAccountBalance();
    const lowBalanceThreshold = 1000;

    res.json({
      success: true,
      data: {
        ...account,
        lowBalance: account.credits < lowBalanceThreshold,
        threshold: lowBalanceThreshold,
        estimatedValueGHS: Math.round(account.credits * 0.05 * 15),
      },
    });
  } catch (err) {
    console.error('[getMagicHourBalance]', err);
    res.status(500).json({ error: err.message || 'Failed to fetch Magic Hour balance.' });
  }
};

// ── 7. USER CREDIT USAGE (FIXED AGGREGATION) ──
export const getUserCreditUsage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const usage = await Asset.aggregate([
      {
        $group: {
          _id: '$userId',
          // Use $ifNull so assets without creditsCost don't break the sum
          totalCreditsUsed: { $sum: { $ifNull: ['$creditsCost', 0] } },
          generationCount: { $sum: 1 },
          lastGenerationAt: { $max: '$createdAt' },
        },
      },
      { $sort: { totalCreditsUsed: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      // ✅ CRITICAL FIX: preserveNullAndEmptyArrays prevents crash on orphaned assets
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          userId: '$_id',
          // Fallback for deleted users
          email: { $ifNull: ['$user.email', 'Deleted user'] },
          totalCreditsUsed: 1,
          generationCount: 1,
          lastGenerationAt: 1,
          remainingCredits: { $ifNull: ['$user.credits', 0] },
        },
      },
    ]);

    const totalAgg = await Asset.aggregate([
      { $group: { _id: '$userId' } },
      { $count: 'count' },
    ]);
    const total = totalAgg[0]?.count || 0;

    res.json({ usage, total, pages: Math.ceil(total / limit), page });
  } catch (err) {
    console.error('[getUserCreditUsage] FULL ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── 8. CONSOLIDATED OVERVIEW ──
// One endpoint that feeds the entire AdminOverview dashboard.
export const getOverview = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // ── KPI cards ──
    const [
      totalUsers,
      totalAssets,
      assetsToday,
      txAgg,
      activeToday,
      newUsersThisMonth,
    ] = await Promise.all([
      User.countDocuments(),
      Asset.countDocuments(),
      Asset.countDocuments({ createdAt: { $gte: startOfDay } }),
      Transaction.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amountUSD' }, count: { $sum: 1 } } },
      ]),
      Asset.distinct('userId', { createdAt: { $gte: startOfDay } }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    const totalRevenue = txAgg[0]?.total || 0;
    const totalTransactions = txAgg[0]?.count || 0;

    // ── 7-day generation timeseries ──
    const dailyAgg = await Asset.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          credits: { $sum: { $ifNull: ['$creditsCost', 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill gaps so the chart always has 7 entries
    const days = [];
    const dayMap = new Map(dailyAgg.map((d) => [d._id, d]));
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const hit = dayMap.get(key);
      days.push({
        date: key,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count: hit?.count || 0,
        credits: hit?.credits || 0,
      });
    }

    // ── Asset type breakdown ──
    const typeAgg = await Asset.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);
    const typeBreakdown = { image: 0, video: 0, audio: 0 };
    typeAgg.forEach((r) => {
      if (r._id in typeBreakdown) typeBreakdown[r._id] = r.count;
    });

    // ── Plan distribution ──
    const planAgg = await User.aggregate([
      { $group: { _id: { $ifNull: ['$plan', 'free'] }, count: { $sum: 1 } } },
    ]);
    const planDistribution = { free: 0, pro: 0, enterprise: 0 };
    planAgg.forEach((r) => {
      const id = r._id || 'free';
      if (id in planDistribution) planDistribution[id] = r.count;
    });

    // ── Recent signups (last 5) ──
    const recentUsers = await User.find()
      .select('email plan credits createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // ── Recent transactions (last 5) ──
    const recentTransactions = await Transaction.find({ status: 'success' })
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // ── Live chat stats ──
    const openChats = await Asset.db
      .collection('chatconversations')
      .countDocuments({ status: 'open' })
      .catch(() => 0);

    res.json({
      kpis: {
        totalUsers,
        totalAssets,
        assetsToday,
        activeToday: activeToday.length,
        totalRevenue,
        totalTransactions,
        newUsersThisMonth,
      },
      dailyGeneration: days,
      typeBreakdown,
      planDistribution,
      recentUsers,
      recentTransactions,
      openChats,
    });
  } catch (err) {
    console.error('[getOverview] FULL ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};