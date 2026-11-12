const passService = require('./pass.service');
const asyncHandler = require('../../utils/asyncHandler');

const createPass = asyncHandler(async (req, res) => {
  const pass = await passService.createPass(req.body, req.user.uid);
  res.status(201).send({ status: 'success', data: pass });
});

const getPasses = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    passType: req.query.passType
  };
  const passes = await passService.getPasses(filters);
  res.status(200).send({ status: 'success', data: passes });
});

const getPassById = asyncHandler(async (req, res) => {
  const pass = await passService.getPassById(req.params.id);
  res.status(200).send({ status: 'success', data: pass });
});

const updatePassStatus = asyncHandler(async (req, res) => {
  const pass = await passService.updatePassStatus(req.params.id, req.body.status, req.body.remarks, req.user.uid);
  res.status(200).send({ status: 'success', data: pass });
});

const updatePassDocuments = asyncHandler(async (req, res) => {
  const pass = await passService.updatePassDocuments(req.params.id, req.body.documents, req.user.uid);
  res.status(200).send({ status: 'success', data: pass });
});

const cancelPass = asyncHandler(async (req, res) => {
  const pass = await passService.cancelPass(req.params.id, req.body.reason, req.body.date, req.user.uid);
  res.status(200).send({ status: 'success', data: pass });
});

const deletePass = asyncHandler(async (req, res) => {
  await passService.deletePass(req.params.id);
  res.status(200).send({ status: 'success', message: 'Pass application deleted successfully' });
});

const getExpiryReminders = asyncHandler(async (req, res) => {
  const window = req.query.window || 'all';
  const reminders = await passService.getExpiryReminders(window);
  res.status(200).send({ status: 'success', data: reminders });
});

module.exports = {
  createPass,
  getPasses,
  getPassById,
  updatePassStatus,
  updatePassDocuments,
  cancelPass,
  deletePass,
  getExpiryReminders
};
