const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

let client = null;
let qrCodeData = null;
let isReady = false;
let isInitializing = false;

function getStatus() {
  return {
    isReady,
    isInitializing,
    hasQR: !!qrCodeData,
  };
}

function getQR() {
  return qrCodeData;
}

async function initialize() {
  if (isInitializing || isReady) return;
  isInitializing = true;
  console.log('📱 Initializing WhatsApp...');

  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
    },
  });

  client.on('qr', async (qr) => {
    console.log('📱 QR Code received — scan with your phone');
    qrCodeData = await qrcode.toDataURL(qr);
    isReady = false;
  });

  client.on('ready', () => {
    console.log('✅ WhatsApp connected!');
    isReady = true;
    isInitializing = false;
    qrCodeData = null;
  });

  client.on('authenticated', () => {
    console.log('✅ WhatsApp authenticated');
  });

  client.on('auth_failure', () => {
    console.log('❌ WhatsApp auth failed');
    isReady = false;
    isInitializing = false;
  });

  client.on('disconnected', () => {
    console.log('❌ WhatsApp disconnected');
    isReady = false;
    isInitializing = false;
    qrCodeData = null;
  });

  await client.initialize();
}

async function sendWhatsApp(to, message) {
  if (!isReady || !client) {
    return { success: false, error: 'WhatsApp not connected. Please scan QR code.' };
  }
  try {
    const number = to.replace(/[^0-9]/g, '');
    const chatId = `${number}@c.us`;
    await client.sendMessage(chatId, message);
    return { success: true };
  } catch (err) {
    console.error('WhatsApp send error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { initialize, sendWhatsApp, getStatus, getQR };
