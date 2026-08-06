require('dotenv').config({ path: '.env.local' });
console.log('URL=' + process.env.AI_TRACK_DATABASE_URL);
console.log('TYPE=' + typeof process.env.AI_TRACK_DATABASE_URL);
console.log('PASS=' + process.env.AI_TRACK_DB_PASSWORD);
console.log('TYPEPASS=' + typeof process.env.AI_TRACK_DB_PASSWORD);
