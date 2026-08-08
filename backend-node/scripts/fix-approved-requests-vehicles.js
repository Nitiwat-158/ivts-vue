'use strict';

/**
 * Script to fix vehicle request approval data inconsistency:
 * 1. Resync all approved vehicle registration requests into `vehicles` and `owner_vehicles` collections.
 * 2. Repair any corrupted `owner_vehicles` records where vehicle_code collided with another vehicle's plate_number.
 */

const mongoose = require('mongoose');
const cfg = require('../config/config');
const Request = require('../server/Project/ivts/models/request.model');
const Vehicle = require('../server/Project/ivts/models/vehicle.model');
const OwnerVehicle = require('../server/Project/ivts/models/owner_vehicle.model');
const vehicleRequestService = require('../server/Project/ivts/service/vehicle_request');

async function fixApprovedRequestsVehicles() {
  const uri = cfg.mongoURI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/IVTS';
  console.log(`[Repair Script] Connecting to MongoDB at: ${uri}`);
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    const approvedRequests = await Request.find({ request_status: 'approved' }).lean();
    console.log(`[Repair Script] Found ${approvedRequests.length} approved request(s).`);

    for (const reqDoc of approvedRequests) {
      console.log(`[Repair Script] Syncing request ID: ${reqDoc._id} (Plate: ${reqDoc.vehicle_info && reqDoc.vehicle_info.license_plate})`);
      await vehicleRequestService._syncVehicleOnApproval(reqDoc, reqDoc.updated_at || new Date());
    }

    // Secondary Cleanup: Verify that each owner_vehicle's plate matches its vehicle_code in vehicles collection
    const allOwnerVehs = await OwnerVehicle.find({}).lean();
    for (const ov of allOwnerVehs) {
      if (ov.vehicle_code) {
        const v = await Vehicle.findById(ov.vehicle_code).lean();
        if (v && v.plate_number !== ov.plate_number) {
          console.warn(`[Repair Script] Detected mismatch in OwnerVehicle ${ov._id}: code ${ov.vehicle_code} has vehicle plate '${v.plate_number}' but OV plate '${ov.plate_number}'`);
          // Repair OV record to point to correct vehicle with matching plate
          const targetVehicle = await Vehicle.findOne({
            $or: [
              { plate_number: ov.plate_number },
              { license_plate: ov.plate_number }
            ]
          }).lean();

          if (targetVehicle) {
            await OwnerVehicle.findByIdAndUpdate(ov._id, {
              $set: {
                vehicle_code: targetVehicle._id,
                vehicle_id: targetVehicle._id
              }
            });
            console.log(`[Repair Script] Fixed OwnerVehicle ${ov._id}: updated vehicle_code to '${targetVehicle._id}' for plate '${ov.plate_number}'`);
          }
        }
      }
    }

    // Summary of current vehicles and owner_vehicles
    const finalVehicles = await Vehicle.find({}).lean();
    const finalOwnerVehicles = await OwnerVehicle.find({}).lean();

    console.log('\n================ DATA REPAIR SUMMARY ================');
    console.log(`Total vehicles in 'vehicles' collection: ${finalVehicles.length}`);
    finalVehicles.forEach(v => console.log(`  - _id: ${v._id}, plate: ${v.plate_number}, user_id: ${v.user_id}, type: ${v.type}`));

    console.log(`Total owner_vehicles in 'owner_vehicles' collection: ${finalOwnerVehicles.length}`);
    finalOwnerVehicles.forEach(ov => console.log(`  - _id: ${ov._id}, code: ${ov.vehicle_code}, plate: ${ov.plate_number}, user_id: ${ov.user_id}`));
    console.log('=====================================================\n');

  } catch (err) {
    console.error('❌ Repair script failed:', err);
    throw err;
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  fixApprovedRequestsVehicles()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = fixApprovedRequestsVehicles;
