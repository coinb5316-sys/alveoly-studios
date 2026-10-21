// utils/useUsdToGhs.js
import { useEffect, useState } from 'react';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

// Must equal server/config/payment.js → USD_TO_GHS_RATE
const FALLBACK_RATE = 15.0;

const CACHE_KEY = 'alveoly:usd-ghs';
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 min

export default function useUsdToGhs() {
  const [rate, setRate] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.ts < CACHE_TTL_MS && typeof cached.rate === 'number') {
        return cached.rate;
      }
    } catch {}
    return FALLBACK_RATE;
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/api/payment/rate`);
        if (!res.ok) return;
        const data = await res.json();
        const value = Number(data?.rate);
        if (!cancelled && Number.isFinite(value) && value > 0) {
          setRate(value);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ rate: value, ts: Date.now() }));
          } catch {}
        }
      } catch {
        // silent — fallback stays
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return rate;
}