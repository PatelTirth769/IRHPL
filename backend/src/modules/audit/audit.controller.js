const auditService = require('./audit.service');
const asyncHandler = require('../../utils/asyncHandler');

const getLogs = asyncHandler(async (req, res) => {
  const filters = {
    action: req.query.action,
    targetId: req.query.targetId,
    actorId: req.query.actorId
  };
  const logs = await auditService.getLogs(filters);
  res.status(200).send({ status: 'success', data: logs });
});

module.exports = {
  getLogs
};
