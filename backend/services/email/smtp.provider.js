// SMTP provider — used when SMTP_HOST + SMTP_USER + SMTP_PASS are set.
// Lazily requires nodemailer so a missing dep on dev machines without SMTP
// configured doesn't crash the boot.

const {
  ticketConfirmationSubject,
  ticketConfirmationText,
  ticketConfirmationHtml,
} = require('./templates');

let cachedTransport = null;

function getTransport() {
  if (cachedTransport) return cachedTransport;
  const nodemailer = require('nodemailer');
  cachedTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return cachedTransport;
}

const FROM = process.env.EMAIL_FROM || 'LuckyDrive <no-reply@luckydrive.co.za>';

const SmtpProvider = {
  async sendTicketConfirmation({ to, name, car, tickets, booking }) {
    const transport = getTransport();
    const info = await transport.sendMail({
      from: FROM,
      to,
      subject: ticketConfirmationSubject({ car }),
      text: ticketConfirmationText({ to, name, car, tickets, booking }),
      html: ticketConfirmationHtml({ to, name, car, tickets, booking }),
    });
    return { provider: 'smtp', messageId: info.messageId, accepted: !!info.accepted?.length };
  },
};

module.exports = SmtpProvider;
