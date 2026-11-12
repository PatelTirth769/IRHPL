const Joi = require('joi');

const createTask = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().allow(''),
  }),
};

const updateTask = {
  body: Joi.object().keys({
    title: Joi.string(),
    description: Joi.string().allow(''),
    completed: Joi.boolean(),
  }),
};

module.exports = { createTask, updateTask };
