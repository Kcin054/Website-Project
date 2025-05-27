// backend/controllers/user.js
const User = require("../Models/User"); // ตรวจสอบ path ของ User Model ของคุณ
const bcrypt = require("bcryptjs"); // สำหรับเข้ารหัส/เปรียบเทียบรหัสผ่าน

// ==============================================================
// 1. getUserProfile: ดึงข้อมูลโปรไฟล์ผู้ใช้
// GET /api/user/:userId
// ==============================================================
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "ไม่อนุญาตให้เข้าถึงข้อมูลโปรไฟล์นี้" });
    }

    const user = await User.findById(userId).select("-password").exec(); // ดึงข้อมูลผู้ใช้ ยกเว้น password

    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    res.json(user); // ส่งข้อมูลโปรไฟล์กลับไป
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์" });
  }
};

// ==============================================================
// 2. updateProfile: อัปเดตข้อมูลโปรไฟล์ผู้ใช้
// PUT /api/user/:userId
// ==============================================================
exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // *** แก้ไขตรงนี้: ใช้ req.user._id แทน req.user.id และแปลงเป็น String เพื่อเปรียบเทียบ ***
    // req.user._id เป็น ObjectId, userId เป็น String
    // ต้องแปลง req.user._id.toString() เพื่อเปรียบเทียบกับ userId ที่เป็น String
    if (req.user._id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "ไม่อนุญาตให้อัปเดตข้อมูลโปรไฟล์นี้" });
    }

    const { name, phoneNumber, address, city, postalCode } = req.body;

    // อัปเดตเฉพาะ field ที่อนุญาตให้แก้ไข
    const updatedUser = await User.findByIdAndUpdate(
      userId, // userId ที่มาจาก req.params (ซึ่งเป็น String)
      { name, phoneNumber, address, city, postalCode },
      { new: true }
    )
      .select("-password")
      .exec();

    if (!updatedUser) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้ที่ต้องการอัปเดต" });
    }

    res.json({ message: "อัปเดตข้อมูลโปรไฟล์สำเร็จ", user: updatedUser });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์" });
  }
};

// ==============================================================
// 3. changePassword: เปลี่ยนรหัสผ่านของผู้ใช้
// PUT /api/user/password
// ==============================================================
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id; // ผู้ใช้ที่เข้าสู่ระบบ
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "กรุณาระบุรหัสผ่านปัจจุบันและรหัสผ่านใหม่" });
    }

    const user = await User.findById(userId).exec();

    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    // เปรียบเทียบรหัสผ่านปัจจุบัน
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
    }

    // เข้ารหัสรหัสผ่านใหม่
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // อัปเดตรหัสผ่านในฐานข้อมูล
    user.password = hashedPassword;
    await user.save(); // ใช้ .save() เพื่อให้ pre-save middleware (ถ้ามี) ทำงาน

    res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" });
  }
};

// ==============================================================
// 4. deleteAccount: ลบบัญชีผู้ใช้
// DELETE /api/user/:userId
// ==============================================================
exports.deleteAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    // ตรวจสอบว่าผู้ใช้ที่กำลังร้องขอ เป็นเจ้าของบัญชีเอง หรือเป็น Admin
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "ไม่อนุญาตให้ลบบัญชีนี้" });
    }

    // ลบผู้ใช้
    const deletedUser = await User.findByIdAndDelete(userId).exec();

    if (!deletedUser) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้ที่ต้องการลบ" });
    }

    // *** สำคัญ: ควรลบข้อมูลที่เกี่ยวข้องอื่นๆ ด้วย ***
    // เช่น ลบคำสั่งซื้อทั้งหมดของผู้ใช้ (ถ้า Order model มี field 'orderBy' ที่อ้างอิง User)
    // await Order.deleteMany({ orderBy: userId });
    // ลบตะกร้าสินค้าของผู้ใช้
    // await Cart.findOneAndDelete({ orderBy: userId });
    // หรือข้อมูลอื่นๆ ที่เชื่อมโยงกับผู้ใช้คนนี้

    res.json({ message: "ลบบัญชีสำเร็จ" });
  } catch (error) {
    console.error("Error in deleteAccount:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบบัญชี" });
  }
};

console.log("Exports from controllers/user.js:", Object.keys(exports));
