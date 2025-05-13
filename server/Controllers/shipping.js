const User = require("../Models/User"); // นำเข้าโมเดลผู้ใช้

exports.saveShippingInfo = async (req, res) => {
  try {
    const userId = req.user._id; // ดึง ID ผู้ใช้จากข้อมูลการยืนยันตัวตน
    const { address, city, postalCode, phoneNumber } = req.body; // ดึงข้อมูลที่อยู่จาก body ของ request

    if (!address || !city || !postalCode) {
      return res
        .status(400)
        .json({ message: "กรุณากรอกที่อยู่, เมือง, และรหัสไปรษณีย์" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { address, city, postalCode, phoneNumber },
      { new: true } // ส่งคืนเอกสารที่อัปเดตแล้ว
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    res
      .status(200)
      .json({
        message: "บันทึกข้อมูลการจัดส่งเรียบร้อยแล้ว",
        user: updatedUser,
      }); // ส่งคืนข้อมูลผู้ใช้ที่อัปเดตแล้ว
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลการจัดส่ง:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getShippingInfo = async (req, res) => {
  try {
    const userId = req.user._id; // ดึง ID ผู้ใช้จากข้อมูลการยืนยันตัวตน

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    res.json({
      address: user.address || "",
      city: user.city || "",
      postalCode: user.postalCode || "",
      phoneNumber: user.phoneNumber || "",
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลการจัดส่ง:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateShippingInfo = async (req, res) => {
  try {
    const userId = req.user._id; // ดึง ID ผู้ใช้จากข้อมูลการยืนยันตัวตน
    const { address, city, postalCode, phoneNumber } = req.body; // ดึงข้อมูลที่อยู่จาก body ของ request

    if (!address || !city || !postalCode) {
      return res
        .status(400)
        .json({ message: "กรุณากรอกที่อยู่, เมือง, และรหัสไปรษณีย์" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { address, city, postalCode, phoneNumber },
      { new: true } // ส่งคืนเอกสารที่อัปเดตแล้ว
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    res.json({
      message: "อัปเดตข้อมูลการจัดส่งเรียบร้อยแล้ว",
      user: updatedUser,
    }); // ส่งคืนข้อมูลผู้ใช้ที่อัปเดตแล้ว
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูลการจัดส่ง:", error);
    res.status(500).json({ message: error.message });
  }
};
