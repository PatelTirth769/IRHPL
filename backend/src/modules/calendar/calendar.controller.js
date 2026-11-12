const calendarService = require('./calendar.service');
const asyncHandler = require('../../utils/asyncHandler');

const getEvents = asyncHandler(async (req, res) => {
  const events = await calendarService.getCalendarEvents(req.user.uid);
  res.status(200).send({ status: 'success', data: events });
});

module.exports = {
  getEvents
};
