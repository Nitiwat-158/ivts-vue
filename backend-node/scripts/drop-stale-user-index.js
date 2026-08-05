'use strict';

/**
 * Script to safely drop stale `iam_user_id_1` index on the `users` MongoDB collection.
 * This resolves the E11000 duplicate key error during user registration when iam_user_id is null.
 */

const mongoose = require('mongoose');
const cfg = require('../config/config');

async function dropStaleUserIndex() {
  const uri = cfg.mongoURI || 'mongodb://127.0.0.1:27017/IVTS';
  console.log(`[Index Cleanup] Connecting to MongoDB at: ${uri}`);
  
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const collection = mongoose.connection.collection('users');

  try {
    const indexes = await collection.indexes();
    const hasIamIndex = indexes.some(idx => idx.name === 'iam_user_id_1');
    if (hasIamIndex) {
      await collection.dropIndex('iam_user_id_1');
      console.log('✅ Successfully dropped stale index: iam_user_id_1 from users collection.');
    } else {
      console.log('ℹ️ Index iam_user_id_1 not found in users collection (already clean).');
    }
  } catch (err) {
    if (err.codeName === 'IndexNotFound' || err.message.includes('index not found')) {
      console.log('ℹ️ Index iam_user_id_1 does not exist.');
    } else {
      console.error('❌ Error dropping index:', err.message);
      throw err;
    }
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  dropStaleUserIndex()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = dropStaleUserIndex;
