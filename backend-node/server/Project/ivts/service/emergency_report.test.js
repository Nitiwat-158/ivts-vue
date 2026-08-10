'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const emergencyReportService = require('./emergency_report');
const EmergencyReport = require('../models/emergency_report.model');
const Vehicle = require('../models/vehicle.model');
const User = require('../models/user.model');

function createResponse() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };
}

test.describe('Emergency report updateStatus', () => {
  let originalFind;
  let originalFindById;
  let originalFindOneAndUpdate;
  let originalVehicleFind;
  let originalVehicleFindOne;
  let originalUserFind;
  let originalUserFindOne;

  test.beforeEach(() => {
    originalFind = EmergencyReport.find;
    originalFindById = EmergencyReport.findById;
    originalFindOneAndUpdate = EmergencyReport.findOneAndUpdate;
    originalVehicleFind = Vehicle.find;
    originalVehicleFindOne = Vehicle.findOne;
    originalUserFind = User.find;
    originalUserFindOne = User.findOne;
  });

  test.afterEach(() => {
    EmergencyReport.find = originalFind;
    EmergencyReport.findById = originalFindById;
    EmergencyReport.findOneAndUpdate = originalFindOneAndUpdate;
    Vehicle.find = originalVehicleFind;
    Vehicle.findOne = originalVehicleFindOne;
    User.find = originalUserFind;
    User.findOne = originalUserFindOne;
  });

  test('accept updates status and assignee atomically and GET reflects the new state immediately', async function () {
    const storedReport = {
      _id: 'ER1001',
      vehicle_id: 'CR0001',
      status: 'NEW',
      assigned_admin_id: null,
      request_type: 'theft',
      severity: 'high',
      incident_time: new Date('2026-08-09T07:22:00Z'),
      submitted_at: new Date('2026-08-09T07:22:00Z'),
      description: 'Test report',
      location: null
    };

    EmergencyReport.findById = () => ({
      lean: async () => storedReport
    });

    EmergencyReport.findOneAndUpdate = async (filter, update) => {
      assert.equal(filter._id, 'ER1001');
      assert.equal(update.$set.status, 'IN_PROGRESS');
      assert.equal(update.$set.assigned_admin_id, 'admin-1');
      Object.assign(storedReport, update.$set);
      return Object.assign({}, storedReport);
    };

    EmergencyReport.find = () => ({
      sort: () => ({
        lean: async () => [Object.assign({}, storedReport)]
      })
    });

    Vehicle.find = () => ({
      lean: async () => [{ _id: 'CR0001', vehicle_code: 'CR0001', plate_number: 'ABC-123' }]
    });

    Vehicle.findOne = () => ({
      lean: async () => ({ _id: 'CR0001', vehicle_code: 'CR0001', plate_number: 'ABC-123' })
    });

    User.find = () => ({
      lean: async () => [{ _id: 'admin-1', user_id: 'admin-1', username: 'alice' }]
    });

    User.findOne = () => ({
      lean: async () => ({ _id: 'admin-1', user_id: 'admin-1', username: 'alice' })
    });

    const response = createResponse();
    await emergencyReportService.updateStatus(
      { params: { id: 'ER1001' }, body: { status: 'IN_PROGRESS', adminId: 'admin-1' } },
      response
    );

    assert.equal(response.statusCode, 200);
    assert.equal(response.payload.data.status, 'IN_PROGRESS');
    assert.equal(response.payload.data.assigned_admin_id.user_id, 'admin-1');

    const listResponse = createResponse();
    await emergencyReportService.getAll({ query: {} }, listResponse);

    assert.equal(listResponse.statusCode, 200);
    assert.equal(listResponse.payload.data[0].status, 'IN_PROGRESS');
    assert.equal(listResponse.payload.data[0].assigned_admin_id.user_id, 'admin-1');
  });

  test('concurrent accept from another admin returns conflict and does not overwrite the assignee', async function () {
    const storedReport = {
      _id: 'ER2001',
      vehicle_id: 'CR0002',
      status: 'IN_PROGRESS',
      assigned_admin_id: 'admin-1',
      request_type: 'breakdown',
      severity: 'medium',
      incident_time: new Date('2026-08-09T07:22:00Z'),
      submitted_at: new Date('2026-08-09T07:22:00Z'),
      description: 'Already assigned',
      location: null
    };

    EmergencyReport.findById = () => ({
      lean: async () => storedReport
    });

    let updateCalled = false;
    EmergencyReport.findOneAndUpdate = async () => {
      updateCalled = true;
      return null;
    };

    const response = createResponse();
    await emergencyReportService.updateStatus(
      { params: { id: 'ER2001' }, body: { status: 'IN_PROGRESS', adminId: 'admin-2' } },
      response
    );

    assert.equal(updateCalled, false);
    assert.equal(response.statusCode, 409);
    assert.equal(response.payload.data.reason, 'report_already_assigned');
    assert.equal(storedReport.assigned_admin_id, 'admin-1');
    assert.equal(storedReport.status, 'IN_PROGRESS');
  });
});