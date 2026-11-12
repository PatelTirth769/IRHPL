const express = require('express');
const calendarController = require('./calendar.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.use(auth());

router.route('/')
  .get(calendarController.getEvents);

module.exports = router;
