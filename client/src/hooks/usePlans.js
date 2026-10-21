// hooks/usePlans.js
import { useEffect, useState } from 'react';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

const DEFAULT_PLANS = {
  free: { monthlyUSD: 0, yearlyUSD: 0, credits: 5 },
  pro: { monthlyUSD: 19, yearlyUSD: 15, credits: 500 },
  enterprise: { monthlyUSD: 99, yearlyUSD: 79, credits: 5000 },
};

let cache = { plans: null, ts: 0 };
const CACHE_TTL_MS = 60 * 1000; // 60s

export default function usePlans() {
  const [plans, setPlans] = useState(() => {
    if (cache.plans && Date.now() - cache.ts < CACHE_TTL_MS) return cache.plans;
    return DEFAULT_PLANS;
  });
  const [loading, setLoading] = useState(!cache.plans);

  useEffect(() => {
    let cancelled = false;

    if (cache.plans && Date.now() - cache.ts < CACHE_TTL_MS) {
      setPlans(cache.plans);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API}/api/settings/prices`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.plans) {
          cache = { plans: data.plans, ts: Date.now() };
          setPlans(data.plans);
        }
      } catch (err) {
        console.error('[usePlans]', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { plans, loading };
}