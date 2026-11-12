const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('./auth.validation');
const authController = require('./auth.controller');

const auth = require('../../middlewares/auth');
const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/otp/send', validate(authValidation.otpSend), authController.sendOtp);
router.post('/otp/verify', validate(authValidation.otpVerify), authController.verifyOtp);
router.post('/google', validate(authValidation.google), authController.googleLogin);
router.post('/refresh', authController.refreshTokens);
router.post('/logout', authController.logout);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);

router.get('/me', auth(), authController.me);

module.exports = router;
