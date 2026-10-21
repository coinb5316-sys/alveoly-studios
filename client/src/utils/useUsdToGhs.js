// utils/useUsdToGhs.js
import { useEffect, useState } from 'react';

const FALLBACK_RATE = 15.5; // reasonable default; overridden when live rate loads
const CACHE_KEY = 'alveoly:usd-ghs';
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

export default function useUsdToGhs() {
  const [rate, setRate] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.rate;
    } catch {}
    return FALLBACK_RATE;
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!res.ok) return;
        const data = await res.json();
        const ghs = data?.rates?.GHS;
        if (typeof ghs === 'number' && ghs > 0 && !cancelled) {
          setRate(ghs);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ rate: ghs, ts: Date.now() }));
          } catch {}
        }
      } catch {
        // keep fallback silently
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return rate;
}