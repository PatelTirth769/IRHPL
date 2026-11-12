const Joi = require('joi');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2),
    turnstileToken: Joi.string().required(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const otpSend = { body: Joi.object().keys({ email: Joi.string().required().email() }) };
const otpVerify = { body: Joi.object().keys({ email: Joi.string().required().email(), otp: Joi.string().required().length(6) }) };
const google = { body: Joi.object().keys({ credential: Joi.string().required() }) };
const forgotPassword = { body: Joi.object().keys({ email: Joi.string().required().email() }) };
const resetPassword = { body: Joi.object().keys({ token: Joi.string().required(), password: Joi.string().required().min(8) }) };

module.exports = { register, login, otpSend, otpVerify, google, forgotPassword, resetPassword };
