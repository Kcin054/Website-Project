const jwt = require("jsonwebtoken");
const User = require("../Models/User");

exports.auth = async (req, res, next) => {
  try {
    //authtoken ต้องตรงกับหน้าบ้าน
    const token = req.headers["authtoken"];
    if (!token) {
      return res.send("No token").status(401);
    }
    const decode = jwt.verify(token, "jwtsecret");
    req.user = decode.user;

    next();
  } catch (err) {
    console.log(err);
    res.send("Token Invalid").status(500);
  }
};

exports.adminCheck = async (req, res, next) => {
  try {
    const userAdmin = await User.findOne({ name: req.user.name })
      .select("-password")
      .exec();
    if (userAdmin.role !== "admin") {
      res.status(403).send("Admin acess denied");
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.send("Admin Access Denied").status(403);
  }
};

exports.authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers["authtoken"];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, "jwtsecret");
    const user = await User.findById(decoded.user.id);
    console.log("user", user);

    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }

    req.user = user; // <--- ข้อมูลผู้ใช้ถูกแนบที่นี่
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
