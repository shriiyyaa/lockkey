const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('⚠️  Email not configured — SMTP_USER/SMTP_PASS missing in .env');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  return transporter;
}

/**
 * Send the revealed password via email
 * @param {string} to - recipient email
 * @param {string} platform - platform name
 * @param {string} password - decrypted password
 */
async function sendPasswordEmail(to, platform, password) {
  const t = getTransporter();
  if (!t) {
    throw new Error('Email service is not configured. Set SMTP credentials in .env');
  }

  await t.sendMail({
    from: `"lockkey" <${process.env.SMTP_USER}>`,
    to,
    subject: `[LOCKKEY] SYSTEM DECRYPTION SUCCESSFUL: ${platform}`,
    html: `
      <div style="font-family: 'Courier New', Courier, monospace; max-width: 500px; margin: 0 auto; padding: 40px; background-color: #faf9f6; border: 4px solid #0a0a0a; color: #0a0a0a;">
        <h2 style="text-transform: uppercase; border-bottom: 2px solid #0a0a0a; padding-bottom: 10px; margin-bottom: 20px; font-size: 18px;">🔓 ACCESS_GRANTED_SUCCESSFUL</h2>
        <p style="font-size: 14px; font-weight: bold;">THE ENCRYPTION FOR <strong>${platform.toUpperCase()}</strong> HAS BEEN CLEARED.</p>
        <div style="background-color: #0a0a0a; color: #faf9f6; padding: 20px; border: 2px solid #3f3f46; margin: 20px 0; font-size: 18px; word-break: break-all;">
          ${password}
        </div>
        <p style="font-size: 12px; border-top: 2px solid #0a0a0a; padding-top: 20px; margin-top: 20px; font-weight: bold;">COMMITMENT_COMPLETED. SESSION_LOGGED.</p>
      </div>
    `
  });
}

module.exports = { sendPasswordEmail };
