const mongoose = require('mongoose');
const Account = require('./server/Project/accounts/models/account.model');

async function seedTestAccount() {
  try {
    console.log('กำลังเชื่อมต่อฐานข้อมูล...');
    // แก้ไข URL ให้ตรงกับที่โปรเจกต์คุณใช้
    await mongoose.connect('mongodb://127.0.0.1:27017/IVTS', { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    });
    
    // ลบบัญชีทดสอบเก่าออกก่อน (ป้องกันการสร้างซ้ำ)
    await Account.deleteMany({ email: 'tester@test.com' });

    // ใช้ข้อมูล JSON ที่สร้างไว้
    const testAccount = new Account({
      "email": "tester@test.com",
      "authen": [{
        "type": new mongoose.Types.ObjectId("66a06852660ccb1debade7c5"),
        "username": "tester01",
        "password": "password123",
        "email": "tester@test.com"
      }],
      "userinfo": {
        "firstName": [{ "key": "th", "value": "สมชาย" }],
        "lastName": [{ "key": "th", "value": "ทดสอบ" }]
      },
      "control": {
        "sso": false,
        "limit": 4,
        "trustedDevices": [],
        "device": []
      },
      "dateTime": new Date() // ให้ระบบใช้วันที่ปัจจุบัน
    });

    await testAccount.save();
    console.log('✅ สร้างบัญชีทดสอบเข้า MongoDB สำเร็จแล้ว! (Username: tester01)');
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
  } finally {
    process.exit(0);
  }
}

seedTestAccount();
