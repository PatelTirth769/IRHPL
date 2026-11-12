const express = require('express');
const authRoute = require('../modules/auth/auth.routes');
const userRoute = require('../modules/user/user.routes');
const passRoute = require('../modules/passManagement/pass.routes');
const auditRoute = require('../modules/audit/audit.routes');

const router = express.Router();

const defaultRoutes = [
  { path: '/ping', route: express.Router().get('/', (req, res) => res.send('pong! Backend is working!')) },
  { path: '/auth', route: authRoute },
  { path: '/users', route: userRoute },
  { path: '/passes', route: passRoute },
  { path: '/audit', route: auditRoute },
  { path: '/license-management', route: require('../modules/licenseManagement/license.routes') },
  { path: '/org-management', route: require('../modules/orgManagement/org.routes') },
  { path: '/storage', route: require('./upload.routes') },
  { path: '/checklists', route: require('../modules/checklist/checklist.routes') },
  { path: '/calendar', route: require('../modules/calendar/calendar.routes') },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
