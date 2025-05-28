// C:\Users\User\web\server\Middleware\uploadSlip.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// กำหนดที่เก็บไฟล์สำหรับ slips โดยเฉพาะ
const slipStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destPath = path.join(__dirname, "../uploads/slips");
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    cb(null, destPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// กำหนด filter สำหรับ slip เท่านั้น
const slipFileFilter = (req, file, cb) => {
  if (file.fieldname === "slip") {
    if (!file.mimetype.startsWith("image")) {
      return cb(
        new Error("Only image files are allowed for payment slip!"),
        false
      );
    }
  } else {
    // หากมี fieldname อื่นที่ไม่ใช่ 'slip' ถูกส่งมาใน middleware นี้ ให้ปฏิเสธ
    return cb(
      new Error("Unexpected field in slip upload: " + file.fieldname),
      false
    );
  }
  cb(null, true);
};

// สร้าง Multer upload instance สำหรับ slips โดยเฉพาะ
exports.uploadSlip = multer({
  storage: slipStorage,
  fileFilter: slipFileFilter,
  limits: { fileSize: 1024 * 1024 * 50 },
}); // ใช้ .single() ที่ Route ได้เลย หรือใช้ .fields() ถ้าต้องการ

// ถ้าคุณต้องการใช้ .single('slip') ใน Route เลย ให้ export แบบนี้
// exports.uploadSlip = multer({
//     storage: slipStorage,
//     fileFilter: slipFileFilter,
//     limits: { fileSize: 1024 * 1024 * 50 },
// }).single('slip'); // ถ้า export แบบนี้ ให้ใช้ exports.uploadSlip ใน Route ได้เลย
