const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);

// transport
//   .verify()
//   .then(() => logger.info('Connected to email server'))
//   .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));

const sendEmail = async (to, subject, text, html) => {
  const msg = { from: config.email.from, to, subject, text, html };
  await transport.sendMail(msg);
};

const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  const resetPasswordUrl = `${config.frontendUrl}/reset-password/${token}`;
  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

const sendOtpEmail = async (to, otp) => {
  const subject = 'Your Login Code';
  const text = `Your verification code is: ${otp}\n\nIt expires in 10 minutes.`;
  await sendEmail(to, subject, text);
};

module.exports = { transport, sendEmail, sendResetPasswordEmail, sendOtpEmail };
