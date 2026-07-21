const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/IVTS');
  const db = mongoose.connection.db;

  const vehicle = await db.collection('vehicles').findOne({});
  const user = await db.collection('User').findOne({});
  const emr = await db.collection('emergency reports').findOne({});

  console.log('Vehicle _id:', vehicle ? vehicle._id : 'null', 'Type:', vehicle ? typeof vehicle._id : 'N/A');
  console.log('User _id:', user ? user._id : 'null', 'Type:', user ? typeof user._id : 'N/A');
  console.log('EMR vehicle_id:', emr ? emr.vehicle_id : 'null', 'Type:', emr ? typeof emr.vehicle_id : 'N/A');
  console.log('EMR assigned_admin_id:', emr ? emr.assigned_admin_id : 'null', 'Type:', emr ? typeof emr.assigned_admin_id : 'N/A');

  await mongoose.disconnect();
}

run().catch(console.error);
