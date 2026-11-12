const express = require('express');
const licenseController = require('./license.controller');
const auth = require('../../middlewares/auth');
const { 
  C_COMPANIES, C_LOCATIONS, C_ZONES, 
  C_STORES, C_GOV_BODIES, C_LICENSES 
} = require('./license.service');

const router = express.Router();

// Protect all routes
router.use(auth());

// Generic Entity CRUD routes
const collections = [
  { path: 'companies', name: C_COMPANIES },
  { path: 'locations', name: C_LOCATIONS },
  { path: 'zones', name: C_ZONES },
  { path: 'stores', name: C_STORES },
  { path: 'gov-bodies', name: C_GOV_BODIES },
  { path: 'licenses', name: C_LICENSES }
];

collections.forEach(({ path, name }) => {
  router
    .route(`/${path}`)
    .get(licenseController.getCollection(name))
    .post(licenseController.createEntity(name));

  router
    .route(`/${path}/:id`)
    .patch(licenseController.updateEntity(name))
    .delete(licenseController.deleteEntity(name));
});

// License-specific routes
router.get('/reminders/expiry', licenseController.getExpiryReminders);
router.patch('/licenses/:id/status', licenseController.updateLicenseStatus);
router.patch('/licenses/:id/documents', licenseController.updateLicenseDocuments);
router.post('/licenses/:id/modifications', licenseController.addLicenseModification);

module.exports = router;
