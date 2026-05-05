const axios = require('axios');

const WHAPI_TOKEN = process.env.WHAPI_TOKEN;
const WHAPI_URL   = process.env.WHAPI_URL || 'https://gate.whapi.cloud';

async function sendWhatsApp(to, message) {
  try {
    const number = to.replace(/[^0-9]/g, '');
    const response = await axios.post(
      `${WHAPI_URL}/messages/text`,
      {
        to: `${number}@s.whatsapp.net`,
        body: message,
      },
      {
        headers: {
          Authorization: `Bearer ${WHAPI_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return { success: true, messageId: response.data?.id };
  } catch (err) {
    console.error('WhatsApp send error:', err.message);
    return { success: false, error: err.message };
  }
}

function initialize() {
  console.log('✅ Whapi.Cloud WhatsApp service ready');
}

function getStatus() {
  return { isReady: !!WHAPI_TOKEN, isInitializing: false, hasQR: false };
}

function getQR() { return null; }

module.exports = { initialize, sendWhatsApp, getStatus, getQR };
