'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const mobileService = require('../server/Project/ivts/service/mobile');
const RequestModel = require('../server/Project/ivts/models/request.model');
const EmergencyReportModel = require('../server/Project/ivts/models/emergency_report.model');

test('listRequestHistory includes province and provinceLicense', async () => {
  const VehicleModel = require('../server/Project/ivts/models/vehicle.model');
  const originalVehicleFind = VehicleModel.find;
  const originalFind = RequestModel.find;
  const originalEmgFind = EmergencyReportModel.find;

  VehicleModel.find = function () {
    return {
      lean: async () => []
    };
  };

  const sampleRequest = {
    _id: 'REQ_PRV_TEST_001',
    user_id: 'usr_test_1',
    request_type: 'register',
    created_at: new Date('2026-08-10T10:00:00Z'),
    vehicle_info: {
      license_plate: 'ยส 8579',
      province_license: 'เลย',
      brand: 'TOYOTA',
      model: 'CAMRY',
      color: 'Black'
    },
    owner_info: {
      name: 'Test',
      surname: 'User'
    }
  };

  RequestModel.find = function () {
    return {
      sort: () => ({
        limit: () => ({
          lean: async () => [sampleRequest]
        })
      })
    };
  };

  EmergencyReportModel.find = function () {
    return {
      sort: () => ({
        limit: () => ({
          lean: async () => []
        })
      })
    };
  };

  try {
    const results = await mobileService.listRequestHistory({ user_id: 'usr_test_1' });
    assert.equal(results.length, 1);
    assert.equal(results[0].province, 'เลย');
    assert.equal(results[0].provinceLicense, 'เลย');
    assert.equal(results[0].vehicleCode, 'ยส 8579');
    assert.equal(results[0].ownerName, 'Test User');
  } finally {
    VehicleModel.find = originalVehicleFind;
    RequestModel.find = originalFind;
    EmergencyReportModel.find = originalEmgFind;
  }
});

test('getRequestById returns detailed request object with provinceLicense and province', async () => {
  const originalFindById = RequestModel.findById;

  const sampleRequest = {
    _id: 'REQ_PRV_TEST_002',
    user_id: 'usr_test_1',
    users_id: 'usr_test_1',
    request_type: 'register',
    request_status: 'approved',
    user_type: 'student',
    created_at: new Date('2026-08-10T10:00:00Z'),
    vehicle_info: {
      license_plate: 'ยส 8579',
      province_license: 'เลย',
      brand: 'TOYOTA',
      model: 'CAMRY',
      color: 'Black',
      type: 'car'
    },
    owner_info: {
      name: 'zxcv',
      surname: 'zxcv',
      citizen_id: '1234567890123'
    }
  };

  RequestModel.findById = function (id) {
    assert.equal(id, 'REQ_PRV_TEST_002');
    return {
      lean: async () => sampleRequest
    };
  };

  try {
    const result = await mobileService.getRequestById('REQ_PRV_TEST_002');
    assert.equal(result.id, 'REQ_PRV_TEST_002');
    assert.equal(result.vehicleInfo.province, 'เลย');
    assert.equal(result.vehicleInfo.provinceLicense, 'เลย');
    assert.equal(result.vehicleInfo.licensePlate, 'ยส 8579');
    assert.equal(result.ownerInfo.name, 'zxcv');
  } finally {
    RequestModel.findById = originalFindById;
  }
});
