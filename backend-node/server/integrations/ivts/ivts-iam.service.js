'use strict';

const { createProjectIamService } = require('../iam/project-iam-service');
const { normalizeAudience, normalizeScope } = require('../iam/iam-sdk-adapter');

const DEFAULT_IVTS_SCOPES = [
  'ivts.registry.read',
  'ivts.registry.write',
  'ivts.report.read',
  'iam.security.read',
  'iam.security.write',
  'iam.audit.read',
  'iam.accounts.read'
];

function applyIVTSDefaults(payload) {
  const source = payload || {};
  const metadata = Object.assign({}, source.metadata || {});

  const targetSystem = String(source.targetSystem || metadata.targetSystem || 'ivts').trim();
  const ownerEmail = String(source.ownerEmail || metadata.ownerEmail || 'ivts.integration@example.com').trim();
  const partnerId = String(source.partnerId || metadata.partnerId || 'ivts-team').trim();
  const tenant = String(source.tenant || metadata.tenant || 'iam-shared').trim();
  const systemCode = source.systemCode || metadata.systemCode || null;

  return Object.assign({}, source, {
    targetSystem: targetSystem,
    ownerEmail: ownerEmail,
    partnerId: partnerId,
    tenant: tenant,
    allowedScopes: normalizeScope(source.allowedScopes || metadata.allowedScopes || DEFAULT_IVTS_SCOPES),
    allowedAudiences: normalizeAudience(source.allowedAudiences || metadata.allowedAudiences || 'ivts-api'),
    metadata: Object.assign({}, metadata, systemCode ? {
      systemCode: String(systemCode).trim()
    } : {}, {
      targetSystem: targetSystem,
      ownerEmail: ownerEmail,
      partnerId: partnerId,
      tenant: tenant
    })
  });
}

function createIVTSIamService(config) {
  const projectIamService = createProjectIamService(config);

  return Object.assign({}, projectIamService, {
    async registerManagedClient(payload, options) {
      return projectIamService.registerManagedClient(applyIVTSDefaults(payload), options || {});
    },
    async updateManagedClient(payload, options) {
      return projectIamService.updateManagedClient(applyIVTSDefaults(payload), options || {});
    }
  });
}

module.exports = {
  createIVTSIamService: createIVTSIamService
};
