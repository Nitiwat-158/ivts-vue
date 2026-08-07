'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const mobileService = require('../server/Project/ivts/service/mobile');
const VehicleModel = require('../server/Project/ivts/models/vehicle.model');

test('listVehicles includes ai_track_global_id when mapping exists', async () => {
  // Mock Vehicle.find chain used by the service
  const originalFind = VehicleModel.find;
  const sampleVehicle = { _id: 'CR_TEST', plate_number: 'TH1234', vehicle_code: 'CR_TEST' };

  VehicleModel.find = function () {
    return {
      sort: () => ({
        skip: () => ({
          limit: () => ({
            lean: async () => [sampleVehicle]
          })
        })
      })
    };
  };

  // Create a fake AiTrackMapping model on require cache to return mapping
  const mappingModulePath = require.resolve('../server/Project/ivts/models/ai_track_mapping.model');
  const originalMapping = require.cache[mappingModulePath];
  // Provide a minimal fake module that exports a find()
  require.cache[mappingModulePath] = {
    id: mappingModulePath,
    filename: mappingModulePath,
    loaded: true,
    exports: {
      find: (query) => ({ lean: async () => [{ vehicle_id: 'CR_TEST', global_id: 555 }] })
    }
  };

  try {
    const results = await mobileService.listVehicles({});
    assert.equal(results.length, 1);
    assert.equal(results[0].ai_track_global_id, 555);
  } finally {
    VehicleModel.find = originalFind;
    if (originalMapping) require.cache[mappingModulePath] = originalMapping; else delete require.cache[mappingModulePath];
  }
});
