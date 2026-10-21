// pages/PricingConfirm.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import useUsdToGhs from '../utils/useUsdToGhs';
import usePlans from '../hooks/usePlans';

const PLAN_NAMES = {
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const PLAN_FEATURES = {
  pro: ['500 credits per month', 'Priority queue', 'All premium tools'],
  enterprise: ['5000 credits per month', 'Highest priority queue', 'API access'],
};

export default function PricingConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const ghsRate = useUsdToGhs();
  const { plans, loading: plansLoading } = usePlans();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const planId = (searchParams.get('plan') || 'pro').toLowerCase();
  const billing = (searchParams.get('billing') || 'monthly').toLowerCase();
  const usdFromQuery = Number(searchParams.get('usd'));

  // Resolve price: URL param → live plan → 0
  const livePlan = plans[planId] || {};
  const livePrice = billing === 'yearly' ? livePlan.yearlyUSD : livePlan.monthlyUSD;
  const usd =
    Number.isFinite(usdFromQuery) && usdFromQuery > 0
      ? usdFromQuery
      : Number.isFinite(livePrice) && livePrice > 0
      ? livePrice
      : 0;
  const ghs = Math.round(usd * ghsRate);
  const planName = PLAN_NAMES[planId] || 'Pro';
  const features = PLAN_FEATURES[planId] || PLAN_FEATURES.pro;

  // If plans finished loading and the price is still 0, something is wrong
  const priceUnavailable = !plansLoading && usd <= 0;

  const dismiss = () => navigate('/pricing', { replace: true });

  const subscribe = async () => {
    if (usd <= 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/payment/initialize', {
        plan: planId,
        amountUSD: usd,
        billing,
      });
      if (!res.data?.authorization_url) {
        throw new Error('Paystack did not return a checkout URL. Please try again.');
      }
      window.location.href = res.data.authorization_url;
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          'Could not start checkout. Please try again.'
      );
      setLoading(false);
    }
  };

  // Escape to dismiss
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="page-scroll relative flex min-h-screen items-center justify-center bg-[#fdfbf7] px-4 py-10 text-[#1a1a1a]">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-[var(--coral)] opacity-[0.08] blur-[130px]" />
        <div className="absolute top-[45%] right-[10%] h-[420px] w-[420px] rounded-full bg-[var(--violet)] opacity-[0.06] blur-[130px]" />
      </div>

      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Confirm subscription"
        className="relative z-50 w-full max-w-[460px] overflow-hidden rounded-[28px] border border-black/[0.07] bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]"
      >
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#8a8a8a] transition hover:bg-black/[0.04] hover:text-[#1a1a1a]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <div className="px-7 pb-7 pt-9">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--coral)]" />
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#6b6b6b]">
              Confirm subscription
            </span>
          </div>

          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            You&apos;re subscribing to{' '}
            <span className="font-serif-human italic text-[var(--coral)]">{planName}.</span>
          </h1>

          {user?.email && (
            <p className="mt-2 text-[13px] text-[#6b6b6b]">
              Signed in as <span className="font-medium text-[#1a1a1a]">{user.email}</span>
            </p>
          )}

          {/* Price block — live from admin settings */}
          <div className="mt-6 rounded-2xl border border-black/[0.06] bg-[#fdfbf7] p-5">
            {plansLoading && usd === 0 ? (
              <div className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-black/[0.06]" />
                <div className="h-8 w-32 animate-pulse rounded bg-black/[0.06]" />
              </div>
            ) : priceUnavailable ? (
              <div className="rounded-lg border border-amber-400/30 bg-amber-500/5 px-3 py-2 text-[12px] text-amber-700">
                This plan is not currently available. Please contact support.
              </div>
            ) : (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-[#8a8a8a]">
                      {billing === 'yearly' ? 'Billed yearly' : 'Billed monthly'}
                    </p>
                    <p className="mt-1 text-[32px] font-semibold leading-none tracking-tight">
                      ${usd}
                      <span className="ml-1 text-[13px] font-normal text-[#6b6b6b]">
                        USD / mo
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-[#8a8a8a]">
                      You&apos;ll pay
                    </p>
                    <p className="mt-1 text-[18px] font-semibold text-[var(--coral)]">
                      GH₵ {ghs.toLocaleString()}
                    </p>
                    <p className="text-[10.5px] text-[#8a8a8a]">at rate GH₵{ghsRate}/$</p>
                  </div>
                </div>
                {billing === 'yearly' && (
                  <p className="mt-3 border-t border-black/[0.06] pt-3 text-[11.5px] text-[#6b6b6b]">
                    Charged today:{' '}
                    <span className="font-medium text-[#1a1a1a]">
                      GH₵ {Math.round(usd * 12 * ghsRate).toLocaleString()}
                    </span>{' '}
                    <span className="text-[#8a8a8a]">(${usd * 12} USD)</span>
                  </p>
                )}
              </>
            )}
          </div>

          {/* Features — from admin credits count */}
          <ul className="mt-5 space-y-2 text-[12.5px] text-[#4a4a4a]">
            {features.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <svg
                  viewBox="0 0 24 24"
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--coral)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
                {line}
              </li>
            ))}
          </ul>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-400/30 bg-red-500/5 px-3 py-2 text-[12px] text-red-600"
            >
              {error}
            </div>
          )}

          <button
            onClick={subscribe}
            disabled={loading || priceUnavailable || plansLoading}
            className="mt-6 w-full rounded-xl bg-[#1a1a1a] py-3.5 text-[13.5px] font-semibold text-white transition hover:bg-[#2b2b2b] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? 'Redirecting to Paystack…'
              : priceUnavailable
              ? 'Plan unavailable'
              : `Subscribe — Pay GH₵ ${ghs.toLocaleString()}`}
          </button>

          <button
            onClick={dismiss}
            className="mt-2 w-full rounded-xl py-2.5 text-[12px] font-medium text-[#8a8a8a] transition hover:text-[#1a1a1a]"
          >
            Not now — back to pricing
          </button>

          <p className="mt-3 text-center text-[10.5px] leading-4 text-[#8a8a8a]">
            You&apos;ll be redirected to Paystack to complete payment. Your card
            details never touch our servers.
          </p>
        </div>
      </div>
    </main>
  );
}