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

    // Guarantee plans key always exists so admin UI can render
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

/**
 * Save the entire `plans` object.
 * Body: { plans: { pro: { monthlyUSD, yearlyUSD, credits }, enterprise: {...} } }
 * Free tier is enforced server-side — admin cannot change it.
 */
export const savePlans = async (req, res) => {
  try {
    const incoming = req.body?.plans;
    if (!incoming || typeof incoming !== 'object') {
      return res.status(400).json({ error: 'plans object is required' });
    }

    // Free tier is locked
    const merged = {
      free: DEFAULT_PLANS.free,
    };

    // Validate and merge pro + enterprise
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

/**
 * Reset a plan to its default price.
 * Deleting a paid plan is allowed — it reverts to default, doesn't remove the tier
 * (users still need to be able to subscribe to pro/enterprise).
 */
export const deletePlanPrice = async (req, res) => {
  try {
    const { id } = req.params;
    if (!['pro', 'enterprise', 'free'].includes(id)) {
      return res.status(400).json({ error: 'Unknown plan id' });
    }

    const setting = await Setting.findOne({ key: 'plans' });
    const plans = setting?.value || DEFAULT_PLANS;

    // Reset the requested plan to its default
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
    
    // Optional: Add a "low balance" warning threshold
    const lowBalanceThreshold = 1000; // Example: warn if below 1000 credits
    
    res.json({
      success: true,
      data: {
        ...account,
        lowBalance: account.credits < lowBalanceThreshold,
        threshold: lowBalanceThreshold,
        // Estimate value in GHS for admin context (using a fixed rate for now)
        estimatedValueGHS: Math.round(account.credits * 0.05 * 15), // e.g., 0.05 USD per credit * 15 GHS
      },
    });
  } catch (err) {
    console.error('[getMagicHourBalance]', err);
    res.status(500).json({ error: err.message || 'Failed to fetch Magic Hour balance.' });
  }
};

// controllers/adminController.js (Add this function)
export const getUserCreditUsage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Aggregate usage per user from the Asset collection.
    // Assumes Asset has { userId, creditsCost, createdAt, type }
    const usage = await Asset.aggregate([
      {
        $group: {
          _id: '$userId',
          totalCreditsUsed: { $sum: '$creditsCost' }, // Ensure you save 'creditsCost' when creating an asset
          generationCount: { $sum: 1 },
          lastGenerationAt: { $max: '$createdAt' },
        },
      },
      { $sort: { totalCreditsUsed: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users', // Name of your users collection
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          email: '$user.email',
          totalCreditsUsed: 1,
          generationCount: 1,
          lastGenerationAt: 1,
          remainingCredits: '$user.credits',
        },
      },
    ]);

    // Get total count of users who have generated
    const totalAgg = await Asset.aggregate([
      { $group: { _id: '$userId' } },
      { $count: 'count' },
    ]);
    const total = totalAgg[0]?.count || 0;

    res.json({
      usage,
      total,
      pages: Math.ceil(total / limit),
      page,
    });
  } catch (err) {
    console.error('[getUserCreditUsage]', err);
    res.status(500).json({ error: err.message });
  }
};