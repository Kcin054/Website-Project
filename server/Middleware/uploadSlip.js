const multer = require("multer");
const path = require("path");
const fs = require("fs");

const slipStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destPath = path.join(__dirname, "../uploads/slips");
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

const slipFileFilter = (req, file, cb) => {
  if (file.fieldname === "slip") {
    if (!file.mimetype.startsWith("image")) {
      return cb(
        new Error("Only image files are allowed for payment slip!"),
        false
      );
    }
  } else {
    return cb(
      new Error("Unexpected field in slip upload: " + file.fieldname),
      false
    );
  }
  cb(null, true);
};

exports.uploadSlip = multer({
  storage: slipStorage,
  fileFilter: slipFileFilter,
  limits: { fileSize: 1024 * 1024 * 50 },
});
