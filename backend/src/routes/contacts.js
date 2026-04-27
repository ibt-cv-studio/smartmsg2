const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM contacts WHERE user_id = $1 ORDER BY name ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, phone, relationship } = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO contacts (user_id, name, phone, relationship)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.user.id, name, phone, relationship || 'Friend']
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      if (err.code === '23505') return res.status(409).json({ error: 'Contact with this phone already exists.' });
      res.status(500).json({ error: err.message });
    }
  }
);

router.put('/:id', async (req, res) => {
  const { name, phone, relationship } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE contacts SET name=COALESCE($1,name), phone=COALESCE($2,phone),
       relationship=COALESCE($3,relationship), updated_at=NOW()
       WHERE id=$4 AND user_id=$5 RETURNING *`,
      [name, phone, relationship, req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Contact not found.' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM contacts WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Contact not found.' });
    res.json({ message: 'Contact deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
