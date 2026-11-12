const config = require('../config/env');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  const { statusCode, message } = error;

  res.locals.errorMessage = error.message;

  const isLive = config.env === 'production' || (config.frontendUrl && !config.frontendUrl.includes('localhost') && !config.frontendUrl.includes('127.0.0.1'));

  const response = {
    code: statusCode,
    message,
    ...(!isLive && { stack: err.stack }),
  };

  if (!isLive) {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};

module.exports = { errorHandler };
