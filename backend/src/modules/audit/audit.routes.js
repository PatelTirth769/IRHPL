const express = require('express');
const auth = require('../../middlewares/auth');
const auditController = require('./audit.controller');

const router = express.Router();

router.route('/')
  .get(auth(), auditController.getLogs);

module.exports = router;
