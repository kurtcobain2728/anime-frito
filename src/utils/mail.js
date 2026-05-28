const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

async function sendVerificationEmail(email, code) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"AnimeFrito" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Código de Verificación - AnimeFrito',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #100a0d; color: #ffffff;">
        <div style="background: rgba(31, 19, 27, 0.9); padding: 24px; text-align: center; border-radius: 8px 8px 0 0; border-bottom: 2px solid #fadddd;">
          <h1 style="margin:0; font-size: 24px; color: #fadddd;">AnimeFrito</h1>
        </div>
        <div style="background: rgba(45, 27, 38, 0.8); padding: 32px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #ffffff; margin-top: 0;">Verifica tu cuenta</h2>
          <p style="color: #b9a9b2;">Tu código de verificación es:</p>
          <div style="background: rgba(31, 19, 27, 0.6); border: 2px solid #fadddd; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 48px; font-weight: bold; letter-spacing: 16px; color: #fadddd;">${code}</span>
          </div>
          <p style="color: #b9a9b2; font-size: 14px;">Este código expira en 15 minutos.</p>
          <p style="color: #b9a9b2; font-size: 14px;">Si no creaste esta cuenta, ignora este correo.</p>
        </div>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(email, resetLink) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"AnimeFrito" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Recuperar Contraseña - AnimeFrito',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #100a0d; color: #ffffff;">
        <div style="background: rgba(31, 19, 27, 0.9); padding: 24px; text-align: center; border-radius: 8px 8px 0 0; border-bottom: 2px solid #fadddd;">
          <h1 style="margin:0; font-size: 24px; color: #fadddd;">AnimeFrito</h1>
        </div>
        <div style="background: rgba(45, 27, 38, 0.8); padding: 32px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #ffffff; margin-top: 0;">Recuperar tu contraseña</h2>
          <p style="color: #b9a9b2;">Haz clic en el botón de abajo para establecer una nueva contraseña:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background: #fadddd; color: #3a1b28; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          <p style="color: #b9a9b2; font-size: 14px;">Este enlace expira en 1 hora.</p>
          <p style="color: #b9a9b2; font-size: 14px;">Si no solicitaste un cambio de contraseña, ignora este correo.</p>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
          <p style="color: #b9a9b2; font-size: 12px;">O copia este enlace: ${resetLink}</p>
        </div>
      </div>
    `,
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
