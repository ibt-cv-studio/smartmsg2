async function sendWhatsApp(to, message) {
  return { success: false, error: 'WhatsApp pending configuration' };
}

function initialize() {
  console.log('📱 WhatsApp pending configuration');
}

function getStatus() {
  return { isReady: false, isInitializing: false, hasQR: false };
}

function getQR() { return null; }

module.exports = { initialize, sendWhatsApp, getStatus, getQR };
