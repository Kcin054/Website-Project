const jwt = require("jsonwebtoken");
const User = require("../Models/User");

exports.auth = async (req, res, next) => {
  try {
    const token = req.headers["authtoken"];

    if (!token) {
      return res.status(401).send("No token provided");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).exec();

    if (!user) {
      return res.status(401).send("User not found or unauthorized");
    }
    req.user = user;

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    if (err.name === "TokenExpiredError") {
      return res.status(401).send("Token Expired");
    }
    return res.status(401).send("Token Invalid or Unauthorized");
  }
};

exports.adminCheck = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin resource. Access denied." });
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
