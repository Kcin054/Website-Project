const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const Order = require("../Models/Order");

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "ไม่อนุญาตให้เข้าถึงข้อมูลโปรไฟล์นี้" });
    }

    const user = await User.findById(userId).select("-password").exec();

    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "ไม่อนุญาตให้อัปเดตข้อมูลโปรไฟล์นี้" });
    }

    const { name, phoneNumber, address, city, postalCode } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
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

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
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

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();
    res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "ไม่อนุญาตให้ลบบัญชีนี้" });
    }

    const deletedUser = await User.findByIdAndDelete(userId).exec();

    if (!deletedUser) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้ที่ต้องการลบ" });
    }

    res.json({ message: "ลบบัญชีสำเร็จ" });
  } catch (error) {
    console.error("Error in deleteAccount:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบบัญชี" });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { role: { $regex: search, $options: "i" } },
          { phoneNumber: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(query).select("-password").exec();
    res.json(users);
  } catch (error) {
    console.error("Error in listUsers:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const slipFile = req.file;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required." });
    }
    if (!slipFile) {
      return res.status(400).json({ message: "Payment slip is required." });
    }
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    order.slipFile = slipFile.filename;
    order.paymentStatus = "Pending Admin Confirmation";

    await order.save();

    res.status(200).json({
      message: "Payment slip uploaded successfully. Order status updated.",
      order: order,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res
      .status(500)
      .json({ message: "Failed to confirm payment.", error: error.message });
  }
};
