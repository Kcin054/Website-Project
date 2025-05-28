const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "file") {
      cb(null, path.join(__dirname, "../uploads/images"));
    } else if (file.fieldname === "pdfFile") {
      cb(null, path.join(__dirname, "../uploads/pdfs"));
    } else {
      cb(new Error("Invalid fieldname"), null);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

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

  cb(null, true);
};
exports.upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 50 },
}).fields([
  { name: "file", maxCount: 1 },
  { name: "pdfFile", maxCount: 1 },
]);
