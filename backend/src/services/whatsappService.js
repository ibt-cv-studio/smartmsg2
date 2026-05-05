const axios = require('axios');

const WHAPI_TOKEN = process.env.WHAPI_TOKEN;
const WHAPI_URL   = process.env.WHAPI_URL || 'https://gate.whapi.cloud';

async function sendWhatsApp(to, message) {
  try {
    // Clean number and add Rwanda code if missing
    let number = to.replace(/[^0-9]/g, '');
    if (number.startsWith('07') || number.startsWith('08')) {
      number = '250' + number.substring(1);
    }
    if (!number.startsWith('250') && number.length === 9) {
      number = '250' + number;
    }

    console.log(`📱 Sending to WhatsApp number: ${number}`);

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
    console.log(`✅ Whapi response:`, response.data);
    return { success: true, messageId: response.data?.id };
  } catch (err) {
    console.error('❌ WhatsApp send error:', err.response?.data || err.message);
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
