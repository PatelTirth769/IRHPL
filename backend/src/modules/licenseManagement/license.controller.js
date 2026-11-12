const licenseService = require('./license.service');
const catchAsync = require('../../utils/asyncHandler');

const createEntity = (collectionName) => catchAsync(async (req, res) => {
  const result = await licenseService.createEntity(collectionName, req.body, req.user.uid);
  res.status(201).json({ success: true, data: result });
});

const getCollection = (collectionName) => catchAsync(async (req, res) => {
  const result = await licenseService.getCollection(collectionName);
  res.status(200).json({ success: true, data: result });
});

const updateEntity = (collectionName) => catchAsync(async (req, res) => {
  const result = await licenseService.updateEntity(collectionName, req.params.id, req.body, req.user.uid);
  res.status(200).json({ success: true, data: result });
});

const deleteEntity = (collectionName) => catchAsync(async (req, res) => {
  await licenseService.deleteEntity(collectionName, req.params.id, req.user.uid);
  res.status(200).json({ success: true, data: {} });
});

// License Specific Controllers

const updateLicenseStatus = catchAsync(async (req, res) => {
  const { status, remarks } = req.body;
  const result = await licenseService.updateLicenseStatus(req.params.id, status, remarks, req.user.uid);
  res.status(200).json({ success: true, data: result });
});

const updateLicenseDocuments = catchAsync(async (req, res) => {
  const { documents } = req.body;
  const result = await licenseService.updateLicenseDocuments(req.params.id, documents, req.user.uid);
  res.status(200).json({ success: true, data: result });
});

const addLicenseModification = catchAsync(async (req, res) => {
  const { type, details, date, documents } = req.body;
  const result = await licenseService.addLicenseModification(req.params.id, type, details, date, documents, req.user.uid);
  res.status(200).json({ success: true, data: result });
});

const getExpiryReminders = catchAsync(async (req, res) => {
  const result = await licenseService.getExpiryReminders(req.query.window || '30');
  res.status(200).json({ success: true, data: result });
});

module.exports = {
  createEntity,
  getCollection,
  updateEntity,
  deleteEntity,
  updateLicenseStatus,
  updateLicenseDocuments,
  addLicenseModification,
  getExpiryReminders
};
