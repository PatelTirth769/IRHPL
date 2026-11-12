const taskService = require('./task.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask({ ...req.body, user: req.user.id });
  res.status(201).send(new ApiResponse(201, task, 'Task created'));
});

const getTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getTasks(req.user.id);
  res.send(new ApiResponse(200, tasks, 'Tasks fetched'));
});

const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id, req.user.id);
  res.send(new ApiResponse(200, task, 'Task fetched'));
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTaskById(req.params.id, req.user.id, req.body);
  res.send(new ApiResponse(200, task, 'Task updated'));
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTaskById(req.params.id, req.user.id);
  res.send(new ApiResponse(200, null, 'Task deleted'));
});

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
