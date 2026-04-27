const router = require('express').Router();
const { initialize, getStatus, getQR } = require('../services/whatsappService');

// GET status
router.get('/status', (req, res) => {
  res.json(getStatus());
});

// GET QR code
router.get('/qr', (req, res) => {
  const qr = getQR();
  if (!qr) {
    return res.json({ qr: null, message: 'No QR code available' });
  }
  res.json({ qr });
});

// POST initialize WhatsApp
router.post('/initialize', async (req, res) => {
  try {
    initialize();
    res.json({ message: 'WhatsApp initialization started. Check /qr for QR code.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
