const Joi = require('joi');
const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const validSchema = Joi.compile(schema);
  const object = Object.keys(schema).reduce((acc, key) => {
    if (req[key]) {
      acc[key] = req[key];
    }
    return acc;
  }, {});

  const { value, error } = validSchema.validate(object, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(400, errorMessage));
  }
  Object.assign(req, value);
  return next();
};

module.exports = validate;
