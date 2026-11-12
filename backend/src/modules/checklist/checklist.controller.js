const checklistService = require('./checklist.service');
const asyncHandler = require('../../utils/asyncHandler');

const getChecklists = asyncHandler(async (req, res) => {
  const checklists = await checklistService.getChecklists(req.user.uid);
  res.status(200).send({ status: 'success', data: checklists });
});

const getChecklistByPassId = asyncHandler(async (req, res) => {
  const checklist = await checklistService.getChecklistByPassId(req.params.passId);
  if (!checklist) {
    res.status(404).send({ status: 'error', message: 'Checklist not found' });
    return;
  }
  res.status(200).send({ status: 'success', data: checklist });
});

const updateChecklistItem = asyncHandler(async (req, res) => {
  const { checked } = req.body;
  const checklist = await checklistService.updateChecklistItem(req.params.id, req.params.itemId, checked, req.user.uid);
  res.status(200).send({ status: 'success', data: checklist });
});

module.exports = {
  getChecklists,
  getChecklistByPassId,
  updateChecklistItem
};
