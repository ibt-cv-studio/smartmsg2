const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middleware/auth');
router.use(auth);
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT sl.*, m.category, m.receiver_name, m.receiver_phone, m.message_text
       FROM send_logs sl JOIN messages m ON m.id = sl.message_id
       WHERE sl.user_id=$1 ORDER BY sl.sent_at DESC LIMIT 100`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
