const multer = require("multer");
const path = require("path");
const fs = require("fs");

// กำหนดที่เก็บไฟล์และชื่อไฟล์สำหรับ Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // ตรวจสอบประเภทไฟล์จาก fieldname
    if (file.fieldname === "file") {
      // สำหรับรูปภาพปก
      cb(null, path.join(__dirname, "../uploads/images")); // เก็บรูปภาพใน uploads/images
    } else if (file.fieldname === "pdfFile") {
      // สำหรับไฟล์ PDF
      cb(null, path.join(__dirname, "../uploads/pdfs")); // เก็บ PDF ใน uploads/pdfs
    } else {
      cb(new Error("Invalid fieldname"), null); // หาก fieldname ไม่ตรง
    }
  },
  filename: function (req, file, cb) {
    // ตั้งชื่อไฟล์ให้ไม่ซ้ำกัน เช่น fieldname-timestamp-randomstring.ext
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// กำหนด filter สำหรับไฟล์
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "file" && !file.mimetype.startsWith("image")) {
    return cb(
      new Error("Only image files are allowed for cover image!"),
      false
    );
  }
  if (file.fieldname === "pdfFile" && file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed for e-book!"), false);
  }

  cb(null, true); // ยอมรับไฟล์
};

// สร้าง Multer upload instance และ Export ออกไป
// ใช้ .fields() เพื่อให้สามารถจัดการไฟล์ได้หลาย fieldname ใน Request เดียว
exports.upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 50 }, // จำกัดขนาดไฟล์ไม่เกิน 50MB
}).fields([
  { name: "file", maxCount: 1 }, // สำหรับรูปภาพปก
  { name: "pdfFile", maxCount: 1 }, // สำหรับไฟล์ PDF
]);
