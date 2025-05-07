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
