const ApiError = require('../../utils/ApiError');

const createUser = async (userBody) => {
  throw new ApiError(501, 'Database disabled: Registration requires persistence.');
};

const queryUsers = async (filter, options) => {
  throw new ApiError(501, 'Database disabled.');
};

const getUserById = async (id) => {
  throw new ApiError(501, 'Database disabled.');
};

const getUserByEmail = async (email) => {
  throw new ApiError(501, 'Database disabled.');
};

const updateUserById = async (userId, updateBody) => {
  throw new ApiError(501, 'Database disabled.');
};

const deleteUserById = async (userId) => {
  throw new ApiError(501, 'Database disabled.');
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
};
