const mongoose = require('mongoose');
const Vehicle = require('./server/Project/ivts/models/vehicle.model');
const User = require('./server/Project/ivts/models/user.model');
const OwnerVehicle = require('./server/Project/ivts/models/owner_vehicle.model');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/IVTS', { useNewUrlParser: true, useUnifiedTopology: true });

  // Use valid 24-char hex strings for ObjectIds
  const veh1Id = new mongoose.Types.ObjectId().toString();
  const veh2Id = new mongoose.Types.ObjectId().toString();
  const veh3Id = new mongoose.Types.ObjectId().toString();

  await OwnerVehicle.deleteMany({});
  await Vehicle.deleteMany({ license_plate: { $in: ['กท 1234', 'ขข 5678', 'จจ 9012'] } });
  await User.deleteMany({ _id: { $in: ['seed_usr_1', 'seed_usr_2', 'seed_usr_3'] } });

  const vehicle1 = new Vehicle({ _id: veh1Id, user_id: 'seed_usr_1', license_plate: 'กท 1234', province_license: 'Bangkok', brand: 'Toyota', model: 'Camry' });
  const vehicle2 = new Vehicle({ _id: veh2Id, user_id: 'seed_usr_2', license_plate: 'ขข 5678', province_license: 'Chiang Mai', brand: 'Honda', model: 'Civic' });
  const vehicle3 = new Vehicle({ _id: veh3Id, user_id: 'seed_usr_3', license_plate: 'จจ 9012', province_license: 'Phuket', brand: 'Nissan', model: 'Almera' });
  await Vehicle.insertMany([vehicle1, vehicle2, vehicle3]);

  const user1 = new User({ _id: 'seed_usr_1', iam_user_id: 'iam_1', name: 'สมชาย', surname: 'ใจดี' });
  const user2 = new User({ _id: 'seed_usr_2', iam_user_id: 'iam_2', name: 'สมหญิง', surname: 'แก้วใส' });
  const user3 = new User({ _id: 'seed_usr_3', iam_user_id: 'iam_3', name: 'วิทยา', surname: 'ประเสริฐ' });
  await User.insertMany([user1, user2, user3]);

  const ownerVehicles = [
    new OwnerVehicle({
      _id: new mongoose.Types.ObjectId().toString(),
      vehicle_id: veh1Id,
      user_id: 'seed_usr_1',
      document_status: 'Pending',
      account_status: 'Active',
      certificate_image_url: 'https://via.placeholder.com/640x480?text=Document+1'
    }),
    new OwnerVehicle({
      _id: new mongoose.Types.ObjectId().toString(),
      vehicle_id: veh2Id,
      user_id: 'seed_usr_2',
      document_status: 'Approved',
      account_status: 'Active',
      reviewed_by_id: 'mock_admin',
      reviewed_by_name: 'Admin System',
      reviewed_at: new Date(),
      certificate_image_url: 'https://via.placeholder.com/640x480?text=Document+2'
    }),
    new OwnerVehicle({
      _id: new mongoose.Types.ObjectId().toString(),
      vehicle_id: veh3Id,
      user_id: 'seed_usr_3',
      document_status: 'Rejected',
      account_status: 'Inactive',
      reviewed_by_id: 'mock_admin',
      reviewed_by_name: 'Admin System',
      reviewed_at: new Date(),
      certificate_image_url: ''
    })
  ];

  await OwnerVehicle.insertMany(ownerVehicles);
  console.log('Seed data inserted successfully.');
  await mongoose.disconnect();
}

run().catch(console.error);
