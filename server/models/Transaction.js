import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reference: { type: String, required: true, unique: true }, // Paystack ref
  plan: { type: String, required: true },
  amountUSD: { type: Number, required: true },
  amountGHS: { type: Number, required: true },
  creditsAdded: { type: Number, required: true },
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Transaction', TransactionSchema);