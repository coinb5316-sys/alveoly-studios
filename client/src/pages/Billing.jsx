import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PLANS = [
  { id: 'free', name: 'Free', price: 0, credits: 5, features: ['5 free credits', 'Standard generation'] },
  { id: 'pro', name: 'Pro', price: 19, credits: 500, features: ['500 credits', 'Priority queue', 'All tools'] },
  { id: 'enterprise', name: 'Enterprise', price: 99, credits: 5000, features: ['5000 credits', 'Highest priority', 'API access'] },
];

export default function Billing() {
  const { user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // UI State
  const [showSuccess, setShowSuccess] = useState(false);
  const [history, setHistory] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  
  // Prevent double-firing in React StrictMode
  const verifyCalled = useRef(false);

  // Fetch payment history on mount
  const loadHistory = async () => {
    try {
      const res = await api.get('/payment/history');
      setHistory(res.data.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Handle Paystack redirect
  useEffect(() => {
    const reference = searchParams.get('reference');
    if (reference && !verifyCalled.current) {
      verifyCalled.current = true; // Lock it
      setLoading(true);
      
      api.post('/payment/verify', { reference })
        .then(async (res) => {
          await refreshUser();
          await loadHistory();
          setShowSuccess(true); // Show the nice modal
          // Clean up URL
          navigate('/dashboard/billing', { replace: true });
        })
        .catch((err) => {
          alert(err.response?.data?.error || 'Payment verification failed.');
        })
        .finally(() => setLoading(false));
    }
  }, [searchParams, navigate, refreshUser]);

  const handleUpgrade = async (plan) => {
    if (plan.id === 'free') return;
    setLoading(true);
    try {
      const res = await api.post('/payment/initialize', { 
        plan: plan.id, 
        amountUSD: plan.price 
      });
      window.location.href = res.data.authorization_url;
    } catch (err) {
      alert(err.response?.data?.error || 'Payment failed to initialize');
      setLoading(false);
    }
  };

  // Generate a simple receipt text file
  const downloadReceipt = (tx) => {
    const receiptText = `
ALVEOLY STUDIOS - PAYMENT RECEIPT
---------------------------------
Date: ${new Date(tx.createdAt).toLocaleString()}
Reference: ${tx.reference}
Plan: ${tx.plan.toUpperCase()}
Amount: $${tx.amountUSD.toFixed(2)} USD (${tx.amountGHS.toFixed(2)} GHS)
Credits Added: ${tx.creditsAdded}
Status: ${tx.status.toUpperCase()}

Thank you for your business!
    `;
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Alveoly_Receipt_${tx.reference}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl py-8 relative">
      
      {/* ── SUCCESS MODAL ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-emerald-500/20 bg-[#09090b] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 className="text-xl font-bold text-white">Payment Successful!</h2>
            <p className="mt-2 text-sm text-white/60">Your credits have been added to your account. Let's get back to creating.</p>
            <button onClick={() => setShowSuccess(false)} className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold text-white">Upgrade your Plan</h1>
        <p className="mt-2 text-white/50">Choose the plan that fits your creative needs.</p>
        <p className="mt-2 text-[11px] text-white/40">Prices are in USD. You will be charged in GHS at the current exchange rate.</p>
      </div>

      {/* ── PRICING CARDS ── */}
      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-6 ${
              plan.id === 'pro' 
                ? 'border-violet-500 bg-violet-500/5 shadow-[0_0_30px_rgba(139,92,246,0.15)]' 
                : 'border-white/10 bg-white/[0.02]'
            }`}
          >
            {plan.id === 'pro' && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                Most Popular
              </span>
            )}
            <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
            <p className="mt-2 text-3xl font-bold text-white">
              ${plan.price}<span className="text-sm font-normal text-white/40">/mo</span>
            </p>
            <ul className="mt-6 space-y-3 text-[13px] text-white/70">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(plan)}
              disabled={loading || user?.plan === plan.id}
              className={`mt-8 w-full rounded-xl py-3 text-[13px] font-semibold transition ${
                user?.plan === plan.id
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : plan.id === 'pro'
                    ? 'bg-violet-600 text-white hover:bg-violet-500'
                    : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {user?.plan === plan.id ? 'Current Plan' : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* ── PAYMENT HISTORY ── */}
      <div className="mt-16">
        <h2 className="mb-4 text-lg font-semibold text-white">Payment History</h2>
        
        {fetchingHistory ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-center">
            <p className="text-sm font-medium text-white/60">No payments yet</p>
            <p className="text-xs text-white/40">Your invoices will appear here once you upgrade.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase text-white/40">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx) => (
                  <tr key={tx._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-mono text-xs">{tx.reference}</td>
                    <td className="px-4 py-3 capitalize">{tx.plan}</td>
                    <td className="px-4 py-3 font-medium text-white">
                      ${tx.amountUSD.toFixed(2)} <span className="text-[10px] text-white/40">USD</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => downloadReceipt(tx)} className="text-xs font-medium text-violet-400 hover:text-violet-300">
                        Download ↓
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}