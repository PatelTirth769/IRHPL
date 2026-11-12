const express = require('express');
const passController = require('./pass.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

// All pass routes are protected
router.use(auth());

router
  .route('/')
  .post(passController.createPass)
  .get(passController.getPasses);

router
  .route('/reminders/expiry')
  .get(passController.getExpiryReminders);

router
  .route('/:id')
  .get(passController.getPassById)
  .delete(passController.deletePass);

router
  .route('/:id/status')
  .patch(passController.updatePassStatus);

router
  .route('/:id/documents')
  .patch(passController.updatePassDocuments);

router
  .route('/:id/cancel')
  .patch(passController.cancelPass);

module.exports = router;
