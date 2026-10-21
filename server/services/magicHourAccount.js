// server/services/magicHourAccount.js
import axios from 'axios';

/**
 * Fetches the current credit balance and subscription details
 * from the Magic Hour API for the account associated with the API key.
 * 
 * Official docs: https://docs.magichour.ai/api-reference/account/get-account-details
 */
export const getMagicHourAccountBalance = async () => {
  const apiKey = process.env.MAGIC_HOUR_API_KEY;
  if (!apiKey) {
    throw new Error('MAGIC_HOUR_API_KEY is not configured on the server.');
  }

  try {
    // ✅ CORRECT domain: api.magichour.ai (not api.magic-hour.ai)
    const response = await axios.get('https://api.magichour.ai/v1/account', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    
    // Response shape: { id, email, tier, credits, subscription }
    return response.data;
  } catch (error) {
    console.error('[MagicHour] Failed to fetch account balance:', error.response?.data || error.message);
    const message = error.response?.data?.message || 'Could not connect to Magic Hour API.';
    throw new Error(message);
  }
};