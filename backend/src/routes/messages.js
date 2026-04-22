const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const pool   = require('../config/db');
const auth   = require('../middleware/auth');
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT m.*,
         (SELECT COUNT(*) FROM send_logs sl WHERE sl.message_id = m.id AND sl.status='sent') AS times_sent,
         (SELECT sl.sent_at FROM send_logs sl WHERE sl.message_id = m.id ORDER BY sl.sent_at DESC LIMIT 1) AS last_sent
       FROM messages m WHERE m.user_id = $1 ORDER BY m.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const [total, active, sentMonth] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM messages WHERE user_id=$1', [req.user.id]),
      pool.query('SELECT COUNT(*) FROM messages WHERE user_id=$1 AND is_active=TRUE', [req.user.id]),
      pool.query(`SELECT COUNT(*) FROM send_logs WHERE user_id=$1 AND status='sent'
                  AND sent_at >= DATE_TRUNC('month', NOW())`, [req.user.id]),
    ]);
    res.json({
      total:      parseInt(total.rows[0].count),
      active:     parseInt(active.rows[0].count),
      sent_month: parseInt(sentMonth.rows[0].count),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM messages WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Message not found.' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/',
  [
    body('category').notEmpty().withMessage('Category is required'),
    body('receiver_phone').notEmpty().withMessage('Receiver phone is required'),
    body('message_text').notEmpty().withMessage('Message text is required'),
    body('send_date').notEmpty().withMessage('Send date is required'),
    body('send_time').notEmpty().withMessage('Send time is required'),
    body('repeat_type').isIn(['once','daily','weekly','yearly']).withMessage('Invalid repeat type'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { category, receiver_name, receiver_phone, message_text, send_date, send_time, repeat_type } = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO messages (user_id,category,receiver_name,receiver_phone,message_text,send_date,send_time,repeat_type)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [req.user.id, category, receiver_name||null, receiver_phone, message_text, send_date, send_time, repeat_type]
      );
      res.status(201).json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
);

router.put('/:id', async (req, res) => {
  const { category, receiver_name, receiver_phone, message_text, send_date, send_time, repeat_type, is_active } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE messages SET
         category=COALESCE($1,category), receiver_name=COALESCE($2,receiver_name),
         receiver_phone=COALESCE($3,receiver_phone), message_text=COALESCE($4,message_text),
         send_date=COALESCE($5,send_date), send_time=COALESCE($6,send_time),
         repeat_type=COALESCE($7,repeat_type), is_active=COALESCE($8,is_active), updated_at=NOW()
       WHERE id=$9 AND user_id=$10 RETURNING *`,
      [category,receiver_name,receiver_phone,message_text,send_date,send_time,repeat_type,is_active,req.params.id,req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Message not found.' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM messages WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Message not found.' });
    res.json({ message: 'Deleted successfully.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
