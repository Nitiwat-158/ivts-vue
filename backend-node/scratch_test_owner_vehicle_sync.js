const mongoose = require('mongoose');
const vehicleRequest = require('./server/Project/ivts/service/vehicle_request');
const OwnerVehicle = require('./server/Project/ivts/models/owner_vehicle.model');
const Vehicle = require('./server/Project/ivts/models/vehicle.model');
const Request = require('./server/Project/ivts/models/request.model');

async function testSyncOnApproval() {
  await mongoose.connect('mongodb://127.0.0.1:27017/IVTS');
  console.log('Connected to MongoDB local instance.');

  const testUserId = 'test_user_sync_99';
  const testPlate = 'ทด 9999';

  // Cleanup prior test artifacts
  await Request.deleteMany({ user_id: testUserId });
  await Vehicle.deleteMany({ plate_number: testPlate });
  await OwnerVehicle.deleteMany({ user_id: testUserId });

  // 1. Submit a request
  const mockReqContext = {
    body: { accounts: testUserId },
    currentAccount: { _id: testUserId }
  };
  const submitBody = {
    request_type: 'register',
    user_type: 'student',
    vehicle_info: {
      license_plate: testPlate,
      province_license: 'Bangkok',
      brand: 'Honda',
      model: 'Civic',
      color: 'White',
      type: 'car'
    },
    owner_info: {
      name: 'TestSync',
      surname: 'User',
      citizen_id: '1234567890123',
      is_owner_match_user: true
    }
  };

  const createdRequest = await vehicleRequest.submit(submitBody, mockReqContext);
  console.log('Submitted Request ID:', createdRequest._id, 'Status:', createdRequest.request_status);

  // 2. Admin Review -> Approved
  const reviewResult = await vehicleRequest.review(createdRequest._id, { request_status: 'approved' }, {});
  console.log('Reviewed Request Status:', reviewResult.request_status);

  // 3. Verify Vehicle collection
  const syncedVehicle = await Vehicle.findOne({ plate_number: testPlate }).lean();
  console.log('Synced Vehicle:', syncedVehicle ? {
    _id: syncedVehicle._id,
    vehicle_code: syncedVehicle.vehicle_code,
    plate_number: syncedVehicle.plate_number,
    user_id: syncedVehicle.user_id
  } : 'NOT FOUND');

  // 4. Verify OwnerVehicle collection
  const syncedOwnerVehicle = await OwnerVehicle.findOne({ user_id: testUserId, plate_number: testPlate }).lean();
  console.log('Synced OwnerVehicle:', syncedOwnerVehicle ? {
    _id: syncedOwnerVehicle._id,
    vehicle_code: syncedOwnerVehicle.vehicle_code,
    plate_number: syncedOwnerVehicle.plate_number,
    user_id: syncedOwnerVehicle.user_id,
    relationship: syncedOwnerVehicle.relationship,
    is_primary: syncedOwnerVehicle.is_primary,
    status: syncedOwnerVehicle.status,
    document_status: syncedOwnerVehicle.document_status
  } : 'NOT FOUND');

  // Cleanup test artifacts
  await Request.deleteMany({ user_id: testUserId });
  await Vehicle.deleteMany({ plate_number: testPlate });
  await OwnerVehicle.deleteMany({ user_id: testUserId });

  await mongoose.disconnect();

  if (syncedVehicle && syncedOwnerVehicle && syncedOwnerVehicle.status === 'active' && syncedOwnerVehicle.document_status === 'Approved') {
    console.log('SUCCESS: All sync verifications passed!');
    process.exit(0);
  } else {
    console.error('FAIL: OwnerVehicle sync did not match expected result!');
    process.exit(1);
  }
}

testSyncOnApproval().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
