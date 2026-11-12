const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const { errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const routes = require('./routes');
const rateLimiter = require('./middlewares/rateLimiter');

const app = express();

if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Always enable trust proxy so reverse proxies (Nginx/Cloudflare/AWS) work in live deployment
app.set('trust proxy', 1);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Auto-detect if running against live domain or localhost
const isLiveProduction = config.env === 'production' || (config.frontendUrl && !config.frontendUrl.includes('localhost') && !config.frontendUrl.includes('127.0.0.1'));

// Production-ready CORS with trailing slash tolerance and multi-origin support
const allowedOrigins = (config.frontendUrl || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        allowedOrigins.includes('*') ||
        cleanOrigin.includes('hrhovercraft.in') ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(new ApiError(403, `Blocked by CORS: Origin ${origin} is not allowed. Check FRONTEND_URL in .env`));
    },
    credentials: true,
  })
);

if (isLiveProduction) {
  app.use('/api/v1/auth', rateLimiter);
}

app.use('/api/v1', routes);

app.use((req, res, next) => next(new ApiError(404, 'Not found')));
app.use(errorHandler);

module.exports = app;
