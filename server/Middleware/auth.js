// const jwt = require("jsonwebtoken");
// const User = require("../Models/User");

// exports.auth = async (req, res, next) => {
//   try {
//     //authtoken ต้องตรงกับหน้าบ้าน
//     const token = req.headers["authtoken"];
//     if (!token) {
//       return res.send("No token").status(401);
//     }
//     const decode = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decode.user;

//     next();
//   } catch (err) {
//     console.log(err);
//     res.send("Token Invalid").status(500);
//   }
// };

// exports.adminCheck = async (req, res, next) => {
//   try {
//     const userAdmin = await User.findOne({ name: req.user.name })
//       .select("-password")
//       .exec();
//     if (userAdmin.role !== "admin") {
//       res.status(403).send("Admin acess denied");
//     } else {
//       next();
//     }
//   } catch (err) {
//     console.log(err);
//     res.send("Admin Access Denied").status(403);
//   }
// };

// exports.authMiddleware = async (req, res, next) => {
//   try {
//     const token = req.headers["authtoken"];

//     if (!token) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     const decoded = jwt.verify(token, "jwtsecret");
//     const user = await User.findById(decoded.user.id);

//     if (!user) {
//       return res.status(401).json({ message: "Invalid user" });
//     }

//     req.user = user; // <--- ข้อมูลผู้ใช้ถูกแนบที่นี่
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

// console.log("Exports from middlewares/auth.js:", Object.keys(exports));
// backend/Middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../Models/User"); // ตรวจสอบ path ของ User Model ของคุณ

// ==============================================================
// Middleware หลักสำหรับยืนยันตัวตน (Authentication)
// ใช้ใน routes/user.js: router.get("/user/:userId", auth, getUserProfile);
// ==============================================================
exports.auth = async (req, res, next) => {
  try {
    const token = req.headers["authtoken"]; // รับ token จาก header "authtoken"

    if (!token) {
      // ถ้าไม่มี token ให้ส่ง 401 Unauthorized
      return res.status(401).send("No token provided");
    }

    // ตรวจสอบและถอดรหัส Token
    // ใช้ process.env.JWT_SECRET ที่ถูกต้อง
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูลโดยใช้ ID ที่ได้จาก Token payload
    // สมมติว่าใน JWT payload มี field ชื่อ _id ที่เก็บ user ID
    // (ถ้าคุณ sign token ด้วย { user: { _id: '...' } } คุณจะต้องใช้ decoded.user._id)
    // แต่การ sign แค่ _id โดยตรงเป็นวิธีที่พบบ่อยกว่าและง่ายกว่า
    const user = await User.findById(decoded.user.id).exec();

    if (!user) {
      // ถ้าไม่พบผู้ใช้ในฐานข้อมูล (อาจถูกลบไปแล้ว)
      return res.status(401).send("User not found or unauthorized");
    }

    // สำคัญที่สุด: แนบข้อมูลผู้ใช้ (จาก DB) ไปกับ req object
    // ตอนนี้ req.user จะมี _id, email, role, name, etc.
    req.user = user;

    next(); // ส่งต่อไปยัง Controller หรือ Middleware ถัดไป
  } catch (err) {
    console.error("Auth Middleware Error:", err); // เปลี่ยน console.log เป็น console.error
    // ส่งสถานะ 401 Unauthorized หาก Token ไม่ถูกต้องหรือหมดอายุ
    if (err.name === "TokenExpiredError") {
      return res.status(401).send("Token Expired");
    }
    return res.status(401).send("Token Invalid or Unauthorized"); // แก้ไข: เปลี่ยน 500 เป็น 401 และตั้ง status ก่อน send
  }
};

// ==============================================================
// Middleware สำหรับตรวจสอบสิทธิ์ Admin (Authorization)
// ==============================================================
exports.adminCheck = (req, res, next) => {
  // Middleware นี้จะทำงานหลังจาก auth middleware
  // ดังนั้น req.user ควรจะมีข้อมูลอยู่แล้ว
  if (req.user && req.user.role === "admin") {
    next(); // อนุญาตให้ไปต่อ
  } else {
    res.status(403).json({ message: "Admin resource. Access denied." }); // ใช้ json() แทน send() เพื่อส่ง object
  }
};

// ==============================================================
// (Optional) ลบ exports.authMiddleware ออกไป หรือคอมเมนต์ไว้
// เนื่องจาก exports.auth ได้รับการปรับปรุงให้ทำหน้าที่เดียวกันแล้ว
// ==============================================================

exports.authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers["authtoken"];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // *** ห้ามใช้ hardcoded secret "jwtsecret" ใน production ***
    const decoded = jwt.verify(token, "jwtsecret"); // <--- ควรเป็น process.env.JWT_SECRET
    const user = await User.findById(decoded.user.id); // <--- ตรวจสอบ decoded.user.id หรือ decoded._id

    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

console.log("Exports from middlewares/auth.js:", Object.keys(exports));
