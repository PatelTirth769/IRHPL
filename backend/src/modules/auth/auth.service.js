const jwt = require('jsonwebtoken');
const moment = require('moment');
const ApiError = require('../../utils/ApiError');
const config = require('../../config/env');
const emailService = require('../../services/email.service');

const verifyTurnstile = async (token) => {
  if (process.env.NODE_ENV === 'test') return true;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: config.turnstileSecret, response: token }),
  });
  const data = await res.json();
  if (!data.success) throw new ApiError(400, 'Invalid Turnstile token');
};

const generateAuthTokens = async (user, res) => {
  throw new ApiError(501, 'Database disabled: Tokens cannot be generated without a persistent user.');
};

const loginUserWithEmailAndPassword = async (email, password) => {
  throw new ApiError(501, 'Database disabled: Login requires persistence.');
};

const sendOtp = async (email) => {
  throw new ApiError(501, 'Database disabled: OTP requires persistence.');
};

const verifyOtp = async (email, otp) => {
  throw new ApiError(501, 'Database disabled: OTP verification requires persistence.');
};

const googleLogin = async (credential) => {
  throw new ApiError(501, 'Database disabled: Google Login requires persistence.');
};

const refreshAuth = async (refreshToken, res) => {
  throw new ApiError(501, 'Database disabled: Token refresh requires persistence.');
};

const forgotPassword = async (email) => {
  throw new ApiError(501, 'Database disabled: Forgot password requires persistence.');
};

const resetPassword = async (token, newPassword) => {
  throw new ApiError(501, 'Database disabled: Reset password requires persistence.');
};

module.exports = {
  verifyTurnstile,
  generateAuthTokens,
  loginUserWithEmailAndPassword,
  sendOtp,
  verifyOtp,
  googleLogin,
  refreshAuth,
  forgotPassword,
  resetPassword,
};
