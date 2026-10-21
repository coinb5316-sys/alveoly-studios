// server/controllers/paymentController.js
import axios from 'axios';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { getUsdToGhsRate } from '../config/payment.js';

/* ─────────────────────────────────────────────
   PUBLIC: Expose the USD → GHS rate
   The frontend hook hits this so every price
   in the UI matches what Paystack will charge.
   ───────────────────────────────────────────── */
export const getRate = (_req, res) => {
  res.json({
    rate: getUsdToGhsRate(),
    base: 'USD',
    quote: 'GHS',
    updatedAt: new Date().toISOString(),
  });
};

/* ─────────────────────────────────────────────
   Initialize a Paystack transaction
   ───────────────────────────────────────────── */
export const initializePayment = async (req, res) => {
  try {
    const { plan, amountUSD, billing = 'monthly' } = req.body;

    if (!plan || amountUSD == null) {
      return res.status(400).json({ error: 'Plan and amountUSD are required' });
    }

    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Use the same rate the UI displays
    const rate = getUsdToGhsRate();
    const amountGHS = Number(amountUSD) * rate;
    const amountInPesewas = Math.round(amountGHS * 100);

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: user.email,
        amount: amountInPesewas,
        currency: 'GHS',
        callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/billing?verify=true`,
        metadata: {
          plan,
          billing,
          userId: user._id.toString(),
          amountUSD: Number(amountUSD),
          rate,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      authorization_url: response.data.data.authorization_url,
      amountGHS,
      rate,
    });
  } catch (err) {
    console.error('Paystack init error:', err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data?.message || 'Failed to initialize payment',
    });
  }
};

/* ─────────────────────────────────────────────
   Verify a Paystack transaction
   ───────────────────────────────────────────── */
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;
    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required' });
    }

    // Idempotency — already processed?
    const existingTx = await Transaction.findOne({ reference });
    if (existingTx) {
      return res.json({
        success: true,
        message: 'Payment already processed',
        creditsAdded: existingTx.creditsAdded,
      });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    const data = response.data.data;

    if (data.status === 'success') {
      const { plan, userId, amountUSD, billing = 'monthly' } = data.metadata || {};

      let creditsToAdd = 50;
      if (plan === 'pro') creditsToAdd = 500;
      if (plan === 'enterprise') creditsToAdd = 5000;

      // Record the transaction FIRST so a duplicate verify can't double-charge
      await Transaction.create({
        userId,
        reference,
        plan,
        billing,
        amountUSD: Number(amountUSD),
        amountGHS: data.amount / 100, // exact amount Paystack charged
        creditsAdded: creditsToAdd,
        status: 'success',
      });

      await User.findByIdAndUpdate(userId, {
        $inc: { credits: creditsToAdd },
        $set: { plan },
      });

      return res.json({ success: true, creditsAdded: creditsToAdd });
    }

    res.status(400).json({
      error: `Payment was not successful (Status: ${data.status})`,
    });
  } catch (err) {
    console.error('Paystack verify error:', err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data?.message || 'Payment verification failed',
    });
  }
};

/* ─────────────────────────────────────────────
   Payment history for the logged-in user
   ───────────────────────────────────────────── */
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: 'Not authorized' });

    const transactions = await Transaction.find({
      userId,
      status: 'success',
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ transactions });
  } catch (err) {
    console.error('[getPaymentHistory]', err);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
};