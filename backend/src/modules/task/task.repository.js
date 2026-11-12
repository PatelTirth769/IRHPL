const Task = require('./task.model');

const createTask = async (taskBody) => {
  return Task.create(taskBody);
};

const getTasks = async (filter) => {
  return Task.find(filter).sort({ createdAt: -1 });
};

const getTaskById = async (id) => {
  return Task.findById(id);
};

const updateTaskById = async (id, updateBody) => {
  return Task.findByIdAndUpdate(id, updateBody, { new: true });
};

const deleteTaskById = async (id) => {
  return Task.findByIdAndDelete(id);
};

module.exports = { createTask, getTasks, getTaskById, updateTaskById, deleteTaskById };
