const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const taskValidation = require('./task.validation');
const taskController = require('./task.controller');

const router = express.Router();

router.use(auth);

router
  .route('/')
  .post(validate(taskValidation.createTask), taskController.createTask)
  .get(taskController.getTasks);

router
  .route('/:id')
  .get(taskController.getTask)
  .patch(validate(taskValidation.updateTask), taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
