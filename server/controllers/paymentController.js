import axios from 'axios';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const USD_TO_GHS_RATE = 15.00; 

export const initializePayment = async (req, res) => {
  try {
    const { plan, amountUSD } = req.body;

    if (!plan || !amountUSD) {
      return res.status(400).json({ error: 'Plan and amountUSD are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const amountGHS = amountUSD * USD_TO_GHS_RATE;
    const amountInPesewas = Math.round(amountGHS * 100);

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: user.email,
        amount: amountInPesewas,
        currency: 'GHS',
        callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/billing?verify=true`,
        metadata: { 
          plan: plan, 
          userId: user._id.toString(),
          amountUSD: amountUSD 
        },
      },
      { 
        headers: { 
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    res.json({ authorization_url: response.data.data.authorization_url });
  } catch (err) {
    console.error('Paystack init error:', err.response?.data || err.message);
    res.status(500).json({ 
      error: err.response?.data?.message || 'Failed to initialize payment' 
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;
    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required' });
    }

    // 1. IDEMPOTENCY CHECK: Has this reference already been processed?
    const existingTx = await Transaction.findOne({ reference });
    if (existingTx) {
      return res.json({ 
        success: true, 
        message: 'Payment already processed', 
        creditsAdded: existingTx.creditsAdded 
      });
    }

    // 2. Verify with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    const data = response.data.data;
    
    if (data.status === 'success') {
      const { plan, userId, amountUSD } = data.metadata;
      
      let creditsToAdd = 50;
      if (plan === 'pro') creditsToAdd = 500;
      if (plan === 'enterprise') creditsToAdd = 5000;

      // 3. Create the transaction record FIRST (to lock the reference)
      await Transaction.create({
        userId,
        reference,
        plan,
        amountUSD: Number(amountUSD),
        amountGHS: data.amount / 100,
        creditsAdded: creditsToAdd,
        status: 'success',
      });

      // 4. Update the user's plan and credits
      await User.findByIdAndUpdate(userId, { 
        $inc: { credits: creditsToAdd },
        $set: { plan: plan }
      });

      return res.json({ success: true, creditsAdded: creditsToAdd });
    }

    res.status(400).json({ error: `Payment was not successful (Status: ${data.status})` });
  } catch (err) {
    console.error('Paystack verify error:', err.response?.data || err.message);
    res.status(500).json({ 
      error: err.response?.data?.message || 'Payment verification failed' 
    });
  }
};

// NEW: Fetch payment history for the user
export const getPaymentHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id, status: 'success' })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
};