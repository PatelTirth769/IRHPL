const app = require('./app');
const config = require('./config/env');
const logger = require('./config/logger');
const { startCron } = require('./modules/passManagement/pass.cron');

let server;

const startServer = async () => {
  startCron();
  server = app.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port}`);
  });
};

startServer();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
