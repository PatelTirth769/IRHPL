const express = require('express');
const checklistController = require('./checklist.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.use(auth());

router.route('/')
  .get(checklistController.getChecklists);

router.route('/pass/:passId')
  .get(checklistController.getChecklistByPassId);

router.route('/:id/items/:itemId')
  .patch(checklistController.updateChecklistItem);

module.exports = router;
