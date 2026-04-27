const cron = require('node-cron');
const pool = require('../config/db');
const { sendWhatsApp, getStatus } = require('../services/whatsappService');

async function getDueMessages() {
  const { rows } = await pool.query(`
    SELECT m.* FROM messages m
    WHERE m.is_active = TRUE
      AND TO_CHAR(m.send_time, 'HH24:MI') = TO_CHAR(NOW(), 'HH24:MI')
      AND (
        m.repeat_type = 'daily'
        OR (m.repeat_type = 'weekly' AND EXTRACT(DOW FROM m.send_date) = EXTRACT(DOW FROM NOW()))
        OR (m.repeat_type = 'yearly' AND TO_CHAR(m.send_date,'MM-DD') = TO_CHAR(NOW(),'MM-DD'))
        OR (m.repeat_type = 'once' AND m.send_date = CURRENT_DATE
            AND NOT EXISTS (
              SELECT 1 FROM send_logs sl WHERE sl.message_id = m.id
              AND sl.status = 'sent' AND sl.sent_at::date = CURRENT_DATE
            ))
      )
      AND NOT EXISTS (
        SELECT 1 FROM send_logs sl WHERE sl.message_id = m.id
        AND sl.sent_at >= NOW() - INTERVAL '1 minute' AND sl.status = 'sent'
      )`);
  return rows;
}

async function processMessage(msg) {
  console.log(`📤 Sending "${msg.category}" to ${msg.receiver_phone}`);

  const status = getStatus();
  let result;

  if (status.isReady) {
    result = await sendWhatsApp(msg.receiver_phone, msg.message_text);
  } else {
    result = { success: false, error: 'WhatsApp not connected' };
  }

  await pool.query(
    `INSERT INTO send_logs (message_id, user_id, status, error_msg) VALUES ($1,$2,$3,$4)`,
    [msg.id, msg.user_id, result.success ? 'sent' : 'failed', result.error || null]
  );

  if (msg.repeat_type === 'once' && result.success) {
    await pool.query(`UPDATE messages SET is_active = FALSE WHERE id = $1`, [msg.id]);
  }

  console.log(result.success ? `  ✅ Sent via WhatsApp` : `  ❌ Failed: ${result.error}`);
}

function startScheduler() {
  console.log('⏰ Scheduler running — checks every minute');
  cron.schedule('* * * * *', async () => {
    try {
      const due = await getDueMessages();
      if (due.length === 0) return;
      console.log(`\n⚡ ${due.length} message(s) due at ${new Date().toLocaleTimeString()}`);
      await Promise.allSettled(due.map(processMessage));
    } catch (err) { console.error('Scheduler error:', err.message); }
  });
}

module.exports = { startScheduler };
