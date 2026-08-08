'use strict';

/**
 * Script to populate/repair missing `user_id` and `users_id` fields on
 * `emergency_report` documents in MongoDB by matching `vehicle_id` against
 * `vehicles`, `owner_vehicles`, or `requests` collections.
 */

const mongoose = require('mongoose');
const cfg = require('../config/config');

async function fixEmergencyReportsUsers() {
  const uri = cfg.mongoURI || 'mongodb://127.0.0.1:27017/IVTS';
  console.log(`[Emergency Report Repair] Connecting to MongoDB at: ${uri}`);

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  const emergencyCol = mongoose.connection.collection('emergency_report');
  const vehiclesCol = mongoose.connection.collection('vehicles');
  const ownerVehiclesCol = mongoose.connection.collection('owner_vehicles');
  const requestsCol = mongoose.connection.collection('requests');

  const reports = await emergencyCol.find({}).toArray();
  console.log(`[Emergency Report Repair] Found ${reports.length} emergency report(s).`);

  let updatedCount = 0;

  for (const report of reports) {
    const reportId = report._id;
    let userId = report.users_id || report.user_id;

    if (!userId && report.vehicle_id) {
      const vehicleId = String(report.vehicle_id);

      // 1. Search in vehicles collection by _id or vehicle_code
      const vehicle = await vehiclesCol.findOne({
        $or: [{ _id: vehicleId }, { vehicle_code: vehicleId }]
      });

      if (vehicle) {
        userId = vehicle.users_id || vehicle.user_id || null;
      }

      // 2. Search in owner_vehicles collection if still missing
      if (!userId) {
        const ownerVehicle = await ownerVehiclesCol.findOne({
          $or: [{ _id: vehicleId }, { vehicle_code: vehicleId }]
        });
        if (ownerVehicle) {
          userId = ownerVehicle.users_id || ownerVehicle.user_id || null;
        }
      }

      // 3. Search in requests collection if still missing
      if (!userId) {
        const reqDoc = await requestsCol.findOne({
          $or: [
            { _id: vehicleId },
            { 'vehicle_info.license_plate': vehicleId }
          ]
        });
        if (reqDoc) {
          userId = reqDoc.users_id || reqDoc.user_id || null;
        }
      }
    }

    if (userId) {
      const result = await emergencyCol.updateOne(
        { _id: reportId },
        { $set: { user_id: String(userId), users_id: String(userId) } }
      );
      console.log(`✅ Updated report [${reportId}] (vehicle: ${report.vehicle_id}) -> user_id: "${userId}"`);
      updatedCount += result.modifiedCount || 1;
    } else {
      console.warn(`⚠️ Report [${reportId}] (vehicle: ${report.vehicle_id}) could not find associated user ID.`);
    }
  }

  console.log(`[Emergency Report Repair] Finished. Total updated: ${updatedCount}`);
}

if (require.main === module) {
  fixEmergencyReportsUsers()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error during repair:', err);
      process.exit(1);
    });
}

module.exports = fixEmergencyReportsUsers;
