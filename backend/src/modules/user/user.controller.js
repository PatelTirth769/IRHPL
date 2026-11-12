const userService = require('./user.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getMe(req.user.id);
  res.send(new ApiResponse(200, user, 'Profile fetched successfully'));
});

module.exports = { getMe };
