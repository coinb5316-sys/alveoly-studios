// server/services/magicHourAccount.js
import axios from 'axios';

/**
 * Fetches the current credit balance and subscription details
 * from the Magic Hour API for the account associated with the API key.
 */
export const getMagicHourAccountBalance = async () => {
  const apiKey = process.env.MAGIC_HOUR_API_KEY;
  if (!apiKey) {
    throw new Error('MAGIC_HOUR_API_KEY is not configured on the server.');
  }

  try {
    const response = await axios.get('https://api.magic-hour.ai/v1/account', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    // The response includes: credits, tier, email, subscription
    return response.data;
  } catch (error) {
    console.error('[MagicHour] Failed to fetch account balance:', error.response?.data || error.message);
    // Throw a descriptive error for the controller to handle
    const message = error.response?.data?.message || 'Could not connect to Magic Hour API.';
    throw new Error(message);
  }
};