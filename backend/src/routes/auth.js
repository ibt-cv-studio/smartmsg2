const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool    = require('../config/db');

router.post('/register',
  [
    body('last_name').trim().notEmpty().withMessage('Last name is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { last_name, phone, password } = req.body;
    try {
      const exists = await pool.query('SELECT id FROM users WHERE phone=$1', [phone]);
      if (exists.rows.length > 0)
        return res.status(409).json({ error: 'This phone number is already registered.' });
      const hashed = await bcrypt.hash(password, 10);
      const { rows } = await pool.query(
        `INSERT INTO users (last_name, phone, password) VALUES ($1,$2,$3)
         RETURNING id, last_name, phone, created_at`,
        [last_name, phone, hashed]
      );
      const user  = rows[0];
      const token = jwt.sign(
        { id: user.id, last_name: user.last_name, phone: user.phone },
        process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      res.status(201).json({ token, user });
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
);

router.post('/login',
  [
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { phone, password } = req.body;
    try {
      const { rows } = await pool.query(
        'SELECT id, last_name, phone, password FROM users WHERE phone=$1', [phone]
      );
      if (!rows.length || !(await bcrypt.compare(password, rows[0].password)))
        return res.status(401).json({ error: 'Incorrect phone number or password.' });
      const user  = rows[0];
      const token = jwt.sign(
        { id: user.id, last_name: user.last_name, phone: user.phone },
        process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      const { password: _, ...safe } = user;
      res.json({ token, user: safe });
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
);
module.exports = router;
