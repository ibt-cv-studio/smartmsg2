const pool = require('./db');
async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running migrations...');
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        last_name  VARCHAR(100) NOT NULL,
        phone      VARCHAR(20)  NOT NULL UNIQUE,
        password   VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category       VARCHAR(50) NOT NULL,
        receiver_name  VARCHAR(100),
        receiver_phone VARCHAR(20) NOT NULL,
        message_text   TEXT NOT NULL,
        send_date      DATE NOT NULL,
        send_time      TIME NOT NULL,
        repeat_type    VARCHAR(20) NOT NULL DEFAULT 'once'
                       CHECK (repeat_type IN ('once','daily','weekly','yearly')),
        is_active      BOOLEAN DEFAULT TRUE,
        created_at     TIMESTAMP DEFAULT NOW(),
        updated_at     TIMESTAMP DEFAULT NOW()
      );`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS send_logs (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status     VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent','failed')),
        error_msg  TEXT,
        sent_at    TIMESTAMP DEFAULT NOW()
      );`);
    await client.query('COMMIT');
    console.log('✅ Migration complete — 3 tables created');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}
migrate();
