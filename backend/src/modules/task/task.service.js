const taskRepository = require('./task.repository');
const ApiError = require('../../utils/ApiError');

const createTask = async (taskBody) => {
  return taskRepository.createTask(taskBody);
};

const getTasks = async (userId) => {
  return taskRepository.getTasks({ user: userId });
};

const getTaskById = async (id, userId) => {
  const task = await taskRepository.getTaskById(id);
  if (!task) throw new ApiError(404, 'Task not found');
  if (task.user.toString() !== userId.toString()) throw new ApiError(403, 'Forbidden');
  return task;
};

const updateTaskById = async (id, userId, updateBody) => {
  await getTaskById(id, userId); // verify ownership
  return taskRepository.updateTaskById(id, updateBody);
};

const deleteTaskById = async (id, userId) => {
  await getTaskById(id, userId);
  return taskRepository.deleteTaskById(id);
};

module.exports = { createTask, getTasks, getTaskById, updateTaskById, deleteTaskById };
