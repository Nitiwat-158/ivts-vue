'use strict';

/**
 * vehicle-approval-sync.test.js
 * Unit tests for vehicle request approval synchronization logic in vehicle_request.js
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const vehicleRequestService = require('../server/Project/ivts/service/vehicle_request');
const Vehicle = require('../server/Project/ivts/models/vehicle.model');
const OwnerVehicle = require('../server/Project/ivts/models/owner_vehicle.model');

test.describe('Vehicle Request Approval Sync', () => {
  let originalVehicleFind;
  let originalVehicleFindOne;
  let originalVehicleCreate;
  let originalVehicleFindByIdAndUpdate;

  let originalOwnerVehicleFind;
  let originalOwnerVehicleFindOne;
  let originalOwnerVehicleCreate;
  let originalOwnerVehicleFindById;
  let originalOwnerVehicleFindByIdAndUpdate;

  test.beforeEach(() => {
    originalVehicleFind = Vehicle.find;
    originalVehicleFindOne = Vehicle.findOne;
    originalVehicleCreate = Vehicle.create;
    originalVehicleFindByIdAndUpdate = Vehicle.findByIdAndUpdate;

    originalOwnerVehicleFind = OwnerVehicle.find;
    originalOwnerVehicleFindOne = OwnerVehicle.findOne;
    originalOwnerVehicleCreate = OwnerVehicle.create;
    originalOwnerVehicleFindById = OwnerVehicle.findById;
    originalOwnerVehicleFindByIdAndUpdate = OwnerVehicle.findByIdAndUpdate;

    // Default mock stubs to avoid live DB connections
    Vehicle.findByIdAndUpdate = async (id, update) => ({ _id: id, ...update.$set });
    OwnerVehicle.findByIdAndUpdate = async (id, update) => ({ _id: id, ...update.$set });
  });

  test.afterEach(() => {
    Vehicle.find = originalVehicleFind;
    Vehicle.findOne = originalVehicleFindOne;
    Vehicle.create = originalVehicleCreate;
    Vehicle.findByIdAndUpdate = originalVehicleFindByIdAndUpdate;

    OwnerVehicle.find = originalOwnerVehicleFind;
    OwnerVehicle.findOne = originalOwnerVehicleFindOne;
    OwnerVehicle.create = originalOwnerVehicleCreate;
    OwnerVehicle.findById = originalOwnerVehicleFindById;
    OwnerVehicle.findByIdAndUpdate = originalOwnerVehicleFindByIdAndUpdate;
  });

  test('should generate non-colliding vehicle_code and owner_vehicle ID when existing docs have gaps', async () => {
    const mockVehiclesInDB = [
      { _id: 'CR0002', vehicle_code: 'CR0002', plate_number: 'ผป 4862' }
    ];

    Vehicle.find = () => ({
      lean: async () => mockVehiclesInDB
    });

    // CR0003 is available
    Vehicle.findOne = (query) => ({
      lean: async () => {
        if (query.$or && query.$or.some(q => q._id === 'CR0003' || q.vehicle_code === 'CR0003')) {
          return null;
        }
        if (query.$or && query.$or.some(q => q._id === 'CR0002' || q.vehicle_code === 'CR0002')) {
          return mockVehiclesInDB[0];
        }
        return null;
      }
    });

    let createdVehicle = null;
    Vehicle.create = async (doc) => {
      createdVehicle = doc;
      return doc;
    };

    OwnerVehicle.find = () => ({
      lean: async () => [{ _id: 'OV0002' }]
    });
    OwnerVehicle.findById = async (id) => (id === 'OV0002' ? { _id: 'OV0002' } : null);
    OwnerVehicle.findOne = async () => null;

    let createdOwnerVehicle = null;
    OwnerVehicle.create = async (doc) => {
      createdOwnerVehicle = doc;
      return doc;
    };

    const mockRequest = {
      _id: 'REQ17861800465241667',
      user_id: 'usr_local_1785930661739_356',
      request_status: 'approved',
      vehicle_info: {
        license_plate: 'ผด 5874',
        brand: 'TOYOTA',
        model: 'Corolla Altis',
        color: 'Gray',
        type: 'car'
      },
      owner_info: {
        name: 'adsf',
        surname: 'ghjk'
      }
    };

    const now = new Date();
    await vehicleRequestService._syncVehicleOnApproval(mockRequest, now);

    assert.ok(createdVehicle, 'Vehicle document should be created');
    assert.equal(createdVehicle._id, 'CR0003', 'Vehicle ID should be CR0003, skipping existing CR0002');
    assert.equal(createdVehicle.plate_number, 'ผด 5874');

    assert.ok(createdOwnerVehicle, 'OwnerVehicle document should be created');
    assert.equal(createdOwnerVehicle._id, 'OV0003', 'OwnerVehicle ID should be OV0003');
    assert.equal(createdOwnerVehicle.vehicle_code, 'CR0003');
    assert.equal(createdOwnerVehicle.plate_number, 'ผด 5874');
  });

  test('should update existing vehicle if plate matches on renewal or re-approval', async () => {
    const existingVeh = {
      _id: 'CR0006',
      vehicle_code: 'CR0006',
      plate_number: 'ผด 5874',
      user_id: 'usr_local_1785930661739_356'
    };

    Vehicle.findOne = () => ({
      lean: async () => existingVeh
    });

    let updatedVehicleId = null;
    let updatedVehiclePayload = null;
    Vehicle.findByIdAndUpdate = async (id, update) => {
      updatedVehicleId = id;
      updatedVehiclePayload = update.$set;
      return { _id: id, ...update.$set };
    };

    OwnerVehicle.findOne = async () => ({
      _id: 'OV0005',
      vehicle_code: 'CR0006'
    });

    let updatedOVId = null;
    let updatedOVPayload = null;
    OwnerVehicle.findByIdAndUpdate = async (id, update) => {
      updatedOVId = id;
      updatedOVPayload = update.$set;
      return { _id: id, ...update.$set };
    };

    const mockRequest = {
      _id: 'REQ17861800465241667',
      user_id: 'usr_local_1785930661739_356',
      request_status: 'approved',
      vehicle_info: {
        license_plate: 'ผด 5874',
        brand: 'TOYOTA',
        model: 'Corolla Altis',
        color: 'Gray',
        type: 'car'
      },
      owner_info: {
        name: 'adsf',
        surname: 'ghjk'
      }
    };

    const now = new Date();
    await vehicleRequestService._syncVehicleOnApproval(mockRequest, now);

    assert.equal(updatedVehicleId, 'CR0006');
    assert.equal(updatedVehiclePayload.plate_number, 'ผด 5874');

    assert.equal(updatedOVId, 'OV0005');
    assert.equal(updatedOVPayload.vehicle_code, 'CR0006');
  });
});
