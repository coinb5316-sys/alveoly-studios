import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useUsdToGhs from '../utils/useUsdToGhs';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    monthly: 0,
    yearly: 0,
    desc: 'For exploring your creativity',
    features: ['5 free credits on signup', 'Access to all basic tools', 'Standard speed', 'Community support'],
    cta: 'Current plan',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 19,
    yearly: 15,
    desc: 'For bringing more ideas to life',
    features: ['500 credits per month', 'Priority queue', 'All premium tools', 'Commercial rights', 'Email support'],
    cta: 'Upgrade to Pro',
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthly: 99,
    yearly: 79,
    desc: 'For teams and heavy usage',
    features: ['5000 credits per month', 'Highest priority queue', 'API access', 'Custom branding', 'Dedicated support'],
    cta: 'Upgrade to Enterprise',
    highlight: false,
  },
];

function CheckIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function Billing() {
  const { user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ghsRate = useUsdToGhs();

  const [billing, setBilling] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [history, setHistory] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const verifyCalled = useRef(false);

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

  useEffect(() => { loadHistory(); }, []);

  // Handle Paystack redirect
  useEffect(() => {
    const reference = searchParams.get('reference');
    if (reference && !verifyCalled.current) {
      verifyCalled.current = true;
      setLoading(true);
      api.post('/payment/verify', { reference })
        .then(async () => {
          await refreshUser();
          await loadHistory();
          setShowSuccess(true);
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
        amountUSD: billing === 'yearly' ? plan.yearly : plan.monthly,
        billing,
      });
      window.location.href = res.data.authorization_url;
    } catch (err) {
      alert(err.response?.data?.error || 'Payment failed to initialize');
      setLoading(false);
    }
  };

  const downloadReceipt = (tx) => {
    const receiptText = `
ALVEOLY STUDIOS - PAYMENT RECEIPT
---------------------------------
Date: ${new Date(tx.createdAt).toLocaleString()}
Reference: ${tx.reference}
Plan: ${tx.plan.toUpperCase()}
Amount: $${tx.amountUSD.toFixed(2)} USD (${tx.amountGHS?.toFixed(2) ?? '—'} GHS)
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
    <div className="mx-auto w-full max-w-[1200px]">
      {/* ═══ SUCCESS MODAL ═══ */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-emerald-500/25 bg-[#0e0d0c] p-7 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white">Payment successful</h2>
            <p className="mt-2 text-[13px] leading-5 text-white/60">
              Your credits have been added. Time to create something great.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="mt-6 w-full rounded-xl bg-emerald-600 py-2.5 text-[13px] font-semibold text-white transition hover:bg-emerald-500"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ═══ HEADER ═══ */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-[10.5px] font-medium uppercase tracking-wider text-white/60">
          <span className="flex h-1.5 w-1.5 rounded-full bg-[#ff6b6b] animate-pulse" />
          Billing & Plans
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Choose the plan that{' '}
          <span className="font-serif-human italic text-[#ff6b6b]">fits you.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[13px] leading-6 text-white/50 sm:text-[13.5px]">
          Start free. Upgrade anytime. Prices are shown in USD, with the GH₵ equivalent based on today&apos;s exchange rate.
        </p>
      </div>

      {/* ═══ Billing toggle ═══ */}
      <div className="mb-8 flex items-center justify-center">
        <div className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.02] p-1">
          <button
            onClick={() => setBilling('monthly')}
            className={`rounded-full px-4 py-2 text-[12px] font-medium transition ${
              billing === 'monthly' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium transition ${
              billing === 'yearly' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            Yearly
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${
                billing === 'yearly' ? 'bg-[#ff6b6b] text-white' : 'bg-[#ff6b6b]/15 text-[#ff8a8a]'
              }`}
            >
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* ═══ Plans ═══ */}
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const usd = billing === 'yearly' ? plan.yearly : plan.monthly;
          const ghs = Math.round(usd * ghsRate);
          const isCurrent = (user?.plan || 'free') === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border bg-white/[0.02] p-6 transition ${
                plan.highlight
                  ? 'border-[#8b5cf6]/40 shadow-[0_10px_50px_-12px_rgba(139,92,246,0.35)] md:-translate-y-1'
                  : 'border-white/[0.08] hover:border-white/[0.14]'
              }`}
            >
              {plan.highlight && !isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#8b5cf6] px-3 py-1 text-[9.5px] font-bold uppercase tracking-wider text-white shadow-sm">
                  Most Popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-[9.5px] font-bold uppercase tracking-wider text-emerald-300">
                  Current plan
                </span>
              )}

              <h3 className="text-[15px] font-semibold text-white">{plan.name}</h3>
              <p className="mt-1.5 text-[12px] text-white/50">{plan.desc}</p>

              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-[38px] font-semibold leading-none tracking-tight text-white">
                    ${usd}
                  </span>
                  {usd !== 0 && (
                    <span className="ml-1 text-[12px] text-white/45">
                      /{billing === 'yearly' ? 'mo, billed yearly' : 'month'}
                    </span>
                  )}
                  {usd === 0 && <span className="ml-1 text-[12px] text-white/45">forever</span>}
                </div>
                {usd !== 0 && (
                  <p className="mt-1 text-[11.5px] text-white/40">
                    ≈ GH₵ {ghs.toLocaleString()} /mo
                  </p>
                )}
              </div>

              <ul className="mt-6 space-y-2.5 text-[12.5px] text-white/70">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                        plan.highlight ? 'bg-[#8b5cf6]/15 text-[#a78bfa]' : 'bg-white/[0.06] text-white/60'
                      }`}
                    >
                      <CheckIcon className="h-2.5 w-2.5" />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan)}
                disabled={isCurrent || loading}
                className={`mt-7 w-full rounded-xl py-2.5 text-[12.5px] font-semibold transition ${
                  isCurrent
                    ? 'cursor-not-allowed bg-white/[0.04] text-white/30'
                    : plan.highlight
                    ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed]'
                    : 'bg-white/[0.08] text-white hover:bg-white/[0.14]'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {isCurrent ? 'Current plan' : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* ═══ TRUST STRIP ═══ */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11.5px] text-white/40">
        <span className="inline-flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Cancel anytime
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Secure Paystack checkout
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Charged in GHS
        </span>
      </div>

      {/* ═══ PAYMENT HISTORY ═══ */}
      <div className="mt-14">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-white">Payment history</h2>
          <span className="text-[11px] text-white/40">
            {history.length} transaction{history.length === 1 ? '' : 's'}
          </span>
        </div>

        {fetchingHistory ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] text-center">
            <p className="text-[13px] font-medium text-white/60">No payments yet</p>
            <p className="mt-1 text-[11.5px] text-white/35">Your invoices will appear here after your first upgrade.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-[12.5px] text-white/70">
                  <thead className="border-b border-white/[0.06] bg-white/[0.02] text-[10.5px] uppercase tracking-wider text-white/40">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((tx) => (
                      <tr key={tx._id} className="border-b border-white/[0.04] transition hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-white/60">{new Date(tx.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-white/50">{tx.reference}</td>
                        <td className="px-4 py-3 capitalize text-violet-300">{tx.plan}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="text-[12.5px] font-medium text-white">${tx.amountUSD.toFixed(2)}</div>
                          {tx.amountGHS != null && (
                            <div className="text-[10.5px] text-white/40">GH₵ {tx.amountGHS.toFixed(2)}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => downloadReceipt(tx)} className="text-[11.5px] font-medium text-violet-400 hover:text-violet-300">
                            Download ↓
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {history.map((tx) => (
                <div key={tx._id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-medium capitalize text-violet-300">{tx.plan} plan</p>
                      <p className="mt-0.5 text-[11px] text-white/40">
                        {new Date(tx.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[13px] font-semibold text-white">${tx.amountUSD.toFixed(2)}</p>
                      {tx.amountGHS != null && (
                        <p className="text-[10.5px] text-white/40">GH₵ {tx.amountGHS.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.04] pt-3">
                    <span className="truncate font-mono text-[10.5px] text-white/40">Ref: {tx.reference}</span>
                    <button onClick={() => downloadReceipt(tx)} className="shrink-0 text-[11px] font-medium text-violet-400 hover:text-violet-300">
                      Download ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}