const accountRoutes = require("../Project/accounts/accounts.routes");
const ivtsRoutes = require("../Project/ivts/ivts.routes");
const mobileRoutes = require("../Project/ivts/mobile.routes");
const securityRoutes = require("../Project/security/security.routes");
const settingsRoutes = require("../Project/settings/settings.routes");

module.exports = function (app) {
  const path = "/api/v1";

  app.use(path + '/ivts', ivtsRoutes);
  // Public, read-only API for the Flutter user-mobile-application (no IAM
  // session yet). See backend-node/server/Project/ivts/mobile.routes.js.
  app.use(path + '/mobile', mobileRoutes);
  app.use(path + '/setting', settingsRoutes);
  app.use(path + '/security', securityRoutes);
  app.use(path, accountRoutes);
};
