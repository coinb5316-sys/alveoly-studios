// controllers/settingsController.js
import Setting from '../models/Setting.js';

/**
 * Shape of the stored setting:
 *   key: 'plans'
 *   value: {
 *     pro: { monthlyUSD: 19, yearlyUSD: 15, credits: 500 },
 *     enterprise: { monthlyUSD: 99, yearlyUSD: 79, credits: 5000 },
 *   }
 *
 * Free tier is fixed and never editable from admin — it's the same
 * across all accounts and stored here only for completeness.
 */
const DEFAULT_PLANS = {
  free: { monthlyUSD: 0, yearlyUSD: 0, credits: 5 },
  pro: { monthlyUSD: 19, yearlyUSD: 15, credits: 500 },
  enterprise: { monthlyUSD: 99, yearlyUSD: 79, credits: 5000 },
};

export const getPublicPlans = async (_req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'plans' }).lean();
    const plans = setting?.value || DEFAULT_PLANS;
    res.json({ plans, updatedAt: setting?.updatedAt || null });
  } catch (err) {
    console.error('[getPublicPlans]', err);
    res.status(500).json({ error: 'Failed to load plans' });
  }
};