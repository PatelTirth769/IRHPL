const authService = require('./auth.service');
const userService = require('../user/user.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const register = asyncHandler(async (req, res) => {
  await authService.verifyTurnstile(req.body.turnstileToken);
  const user = await userService.createUser({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  const tokens = await authService.generateAuthTokens(user, res);
  res.status(201).send(new ApiResponse(201, { user, accessToken: tokens.accessToken }, 'User registered'));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await authService.generateAuthTokens(user, res);
  res.send(new ApiResponse(200, { user, accessToken: tokens.accessToken }, 'Login successful'));
});

const sendOtp = asyncHandler(async (req, res) => {
  await authService.sendOtp(req.body.email);
  res.send(new ApiResponse(200, null, 'OTP sent'));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const user = await authService.verifyOtp(req.body.email, req.body.otp);
  const tokens = await authService.generateAuthTokens(user, res);
  res.send(new ApiResponse(200, { user, accessToken: tokens.accessToken }, 'Login successful'));
});

const googleLogin = asyncHandler(async (req, res) => {
  const user = await authService.googleLogin(req.body.credential);
  const tokens = await authService.generateAuthTokens(user, res);
  res.send(new ApiResponse(200, { user, accessToken: tokens.accessToken }, 'Google Login successful'));
});

const refreshTokens = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) throw new ApiError(401, 'No refresh token provided');
  const tokens = await authService.refreshAuth(refreshToken, res);
  res.send(new ApiResponse(200, { accessToken: tokens.accessToken }, 'Token refreshed'));
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken');
  res.send(new ApiResponse(200, null, 'Logged out'));
});

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  res.send(new ApiResponse(200, null, 'If the email exists, a reset link has been sent'));
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  res.send(new ApiResponse(200, null, 'Password reset successful'));
});

const me = asyncHandler(async (req, res) => {
  // req.user contains the decoded Firebase token
  res.send(new ApiResponse(200, { user: req.user }, 'Current user retrieved successfully'));
});

module.exports = { me,
  register, login, sendOtp, verifyOtp, googleLogin, refreshTokens, logout, forgotPassword, resetPassword
};
