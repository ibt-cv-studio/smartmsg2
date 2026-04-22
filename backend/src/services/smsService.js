require('dotenv').config();
const AfricasTalking = require('africastalking');
const at = AfricasTalking({ apiKey: process.env.AT_API_KEY, username: process.env.AT_USERNAME });
const sms = at.SMS;
async function sendSMS(to, body) {
  try {
    const result = await sms.send({ to: [to], message: body, from: process.env.AT_SENDER_ID || 'SmartMsg' });
    const recipient = result.SMSMessageData.Recipients[0];
    if (recipient.statusCode === 101) return { success: true, messageId: recipient.messageId };
    return { success: false, error: recipient.status };
  } catch (err) {
    console.error('SMS send error:', err.message);
    return { success: false, error: err.message };
  }
}
module.exports = { sendSMS };
