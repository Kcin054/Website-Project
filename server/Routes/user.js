// backend/routes/user.js
const express = require("express");
const router = express.Router();

// นำเข้า middleware สำหรับยืนยันตัวตนและตรวจสอบสิทธิ์
const { auth, authCheck, adminCheck } = require("../Middleware/auth"); // ตรวจสอบ path ของ auth middleware

// นำเข้า controllers
const {
  getUserProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../Controllers/user");

console.log("getUserProfile in routes/user.js:", getUserProfile);
console.log("updateProfile in routes/user.js:", updateProfile);
console.log("changePassword in routes/user.js:", changePassword);
console.log("deleteAccount in routes/user.js:", deleteAccount);

// Route สำหรับดึงข้อมูลโปรไฟล์
router.get("/user/:userId", auth, getUserProfile);

// Route สำหรับเปลี่ยนรหัสผ่าน (ไม่ต้องมี userId ใน path เพราะใช้ req.user._id จาก authCheck)
router.put("/user/password", auth, changePassword);

// Route สำหรับอัปเดตข้อมูลโปรไฟล์
router.put("/user/:userId", auth, updateProfile);

// Route สำหรับลบบัญชี
// ควรระวังการลบบัญชีอย่างมาก อาจมี middleware ตรวจสอบสิทธิ์ที่เข้มงวดกว่าเดิม
router.delete("/user/:userId", auth, deleteAccount);

module.exports = router;
