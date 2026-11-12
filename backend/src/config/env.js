const dotenv = require('dotenv');
const Joi = require('joi');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').default('development'),
    PORT: Joi.number().default(5000),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_REFRESH_SECRET: Joi.string().required().description('JWT refresh secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(15),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(7),
    TURNSTILE_SECRET_KEY: Joi.string().required(),
    GOOGLE_CLIENT_ID: Joi.string().required(),
    SMTP_HOST: Joi.string().required(),
    SMTP_PORT: Joi.number().required(),
    SMTP_USERNAME: Joi.string().allow(''),
    SMTP_PASSWORD: Joi.string().allow(''),
    EMAIL_FROM: Joi.string().required(),
    FRONTEND_URL: Joi.string().default('http://localhost:5173'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  jwt: {
    secret: envVars.JWT_SECRET,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
  },
  turnstileSecret: envVars.TURNSTILE_SECRET_KEY,
  googleClientId: envVars.GOOGLE_CLIENT_ID,
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  frontendUrl: envVars.FRONTEND_URL,
};
