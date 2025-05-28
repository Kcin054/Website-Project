const express = require("express");
const router = express.Router();

const { auth, authCheck, adminCheck } = require("../Middleware/auth");

const {
  getUserProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  listUsers,
} = require("../Controllers/user");

router.get("/user/:userId", auth, getUserProfile);

router.put("/user/password", auth, changePassword);

router.put("/user/:userId", auth, updateProfile);

router.delete("/user/:userId", auth, deleteAccount);

router.get("/admin/users", auth, adminCheck, listUsers);

module.exports = router;
