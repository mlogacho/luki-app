const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!config.SMTP_HOST || !config.SMTP_USER) {
    console.warn(
      '[email] SMTP not configured — welcome emails will be logged to console only.\n' +
      '        Set SMTP_HOST, SMTP_USER, SMTP_PASS in your .env to enable email delivery.'
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  });

  return transporter;
}

/**
 * Send the welcome email with temporary credentials to a new user.
 * Falls back to console.log when SMTP is not configured.
 *
 * @param {{ name: string, email: string, tempPassword: string }} opts
 */
async function sendWelcomeEmail({ name, email, tempPassword }) {
  const subject = `¡Bienvenido a Luki App! Tus credenciales de acceso`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
      <h2 style="color: #4A148C;">¡Bienvenido a Luki App, ${name}!</h2>
      <p>Tu cuenta ha sido creada. A continuación encontrarás tus credenciales de acceso:</p>
      <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; background: #f3f4f6; font-weight: bold; width: 40%;">Correo</td>
          <td style="padding: 8px; background: #f9fafb;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px; background: #f3f4f6; font-weight: bold;">Contraseña temporal</td>
          <td style="padding: 8px; background: #f9fafb; font-family: monospace; font-size: 1.1em; letter-spacing: 2px;">
            ${tempPassword}
          </td>
        </tr>
      </table>
      <p style="color: #ef4444; font-weight: bold;">
        ⚠️ Por seguridad, se te pedirá cambiar esta contraseña al iniciar sesión por primera vez.
      </p>
      <p style="color: #6b7280; font-size: 0.9em;">
        Si no esperabas este correo, puedes ignorarlo.
      </p>
    </div>
  `;

  const transport = getTransporter();

  if (!transport) {
    console.log('\n========== WELCOME EMAIL (SMTP not configured) ==========');
    console.log(`  To:       ${name} <${email}>`);
    console.log(`  Subject:  ${subject}`);
    console.log(`  Password: ${tempPassword}`);
    console.log('=========================================================\n');
    return;
  }

  await transport.sendMail({
    from: `"${config.EMAIL_FROM_NAME}" <${config.EMAIL_FROM_ADDRESS}>`,
    to: `"${name}" <${email}>`,
    subject,
    html,
  });
}

module.exports = { sendWelcomeEmail };
