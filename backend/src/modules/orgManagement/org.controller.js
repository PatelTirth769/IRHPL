const orgService = require('./org.service');
const asyncHandler = require('../../utils/asyncHandler');

const createOrgChain = asyncHandler(async (req, res) => {
  try {
    const result = await orgService.createOrgChain(req.body, req.user?.uid || 'system');
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Error in createOrgChain:', error);
    throw error;
  }
});

const getOrgChains = asyncHandler(async (req, res) => {
  const result = await orgService.getOrgChains();
  res.status(200).json({ success: true, data: result });
});

const deleteOrgChain = asyncHandler(async (req, res) => {
  await orgService.deleteOrgChain(req.params.id, req.user.uid);
  res.status(200).json({ success: true, data: {} });
});

module.exports = {
  createOrgChain,
  getOrgChains,
  deleteOrgChain
};
