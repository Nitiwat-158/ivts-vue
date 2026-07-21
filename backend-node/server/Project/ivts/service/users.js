'use strict';

const mongoose = require('mongoose');

// ✅ โหลด Model จาก user.model.js
const User = require('../models/user.model');

/**
 * List users from MongoDB
 */
async function list(query = {}) {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 25;
  const skip = (page - 1) * limit;

  // เงื่อนไขการค้นหา
  const filter = {};
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { surname: searchRegex },
      { email: searchRegex },
      { _id: searchRegex }
    ];
  }

  // 1. นับจำนวนทั้งหมด
  const total = await User.countDocuments(filter);

  // 2. ดึงข้อมูลผู้ใช้งาน
  const users = await User.find(filter)
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .lean({ virtuals: true });

  // 3. Map ข้อมูลเพิ่มเติมให้ครอบคลุมชื่อฟิลด์ที่ Vue/Vuex ฝั่ง Frontend เรียกใช้
  const formattedUsers = users.map(u => {
    const name = u.name || '';
    const surname = u.surname || '';
    const fullName = u.fullName || `${name} ${surname}`.trim() || 'Unassigned';

    // แปลงวันที่สร้างให้พร้อมโชว์
    const d = u.created_at ? new Date(u.created_at) : new Date();
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear() + 543;
    const createdAtLabel = `${day}/${month}/${year}`;

    return {
      ...u,
      id: u._id,
      fullName: fullName,
      full_name: fullName,
      createdAt: u.created_at,
      createdAtLabel: createdAtLabel
    };
  });

  // 4. ส่ง Response คืนทั้ง key `data` และ `items` ป้องกัน Vuex อ่านผิด Key
  return {
    code: 20000,
    message: "Success",
    data: formattedUsers,
    items: formattedUsers,
    pagination: {
      page: page,
      limit: limit,
      total: total,
      totalPages: Math.ceil(total / limit) || 1,
      hasMore: page * limit < total,
      search: query.search || ""
    }
  };
}

module.exports = {
  list
};