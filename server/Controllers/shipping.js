const User = require("../Models/User");

exports.saveShippingInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { address, province, postalCode, phoneNumber } = req.body;

    if (!address || !province || !postalCode) {
      return res
        .status(400)
        .json({ message: "กรุณากรอกที่อยู่, เมือง, และรหัสไปรษณีย์" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { address, province, postalCode, phoneNumber },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    res.status(200).json({
      message: "บันทึกข้อมูลการจัดส่งเรียบร้อยแล้ว",
      user: updatedUser,
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลการจัดส่ง:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getShippingInfo = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    res.json({
      address: user.address || "",
      province: user.province || "",
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
    const userId = req.user._id;
    const { address, province, postalCode, phoneNumber } = req.body;

    if (!address || !province || !postalCode) {
      return res
        .status(400)
        .json({ message: "กรุณากรอกที่อยู่, เมือง, และรหัสไปรษณีย์" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { address, province, postalCode, phoneNumber },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    res.json({
      message: "อัปเดตข้อมูลการจัดส่งเรียบร้อยแล้ว",
      user: updatedUser,
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูลการจัดส่ง:", error);
    res.status(500).json({ message: error.message });
  }
};
