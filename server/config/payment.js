// server/config/payment.js

/**
 * Single source of truth for the USD → GHS exchange rate.
 *
 * Everywhere in the app that needs the rate (frontend pricing display,
 * confirm modal, billing page, Paystack charge calculation) reads
 * this value — either directly (backend) or via GET /api/payment/rate
 * (frontend).
 *
 * Update this ONE number when the cedi moves, or switch to a live
 * feed by replacing the constant below with a fetch. As long as the
 * rest of the code reads from `getUsdToGhsRate()`, everything stays
 * in sync.
 */
export const USD_TO_GHS_RATE = 15.0;

/**
 * In-memory cache so we can later swap to a live rate without changing
 * every call site. Today it just returns the constant.
 */
export function getUsdToGhsRate() {
  return USD_TO_GHS_RATE;
}

/**
 * Convert USD → GHS and round to 2 decimals (pesewas).
 */
export function usdToGhs(usd) {
  return Math.round(usd * getUsdToGhsRate() * 100) / 100;
}