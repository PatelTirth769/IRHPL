const express = require('express');
const orgController = require('./org.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.use(auth());

router.route('/chains')
  .post(orgController.createOrgChain)
  .get(orgController.getOrgChains);

router.route('/chains/:id')
  .delete(orgController.deleteOrgChain);

module.exports = router;
