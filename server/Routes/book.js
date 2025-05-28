const express = require("express");
const { read, list, create, update, remove } = require("../Controllers/book");
const { auth } = require("../Middleware/auth");
const { upload } = require("../Middleware/upload");
const router = express.Router();

//http://localhost:5000/api/book
router.post("/book", upload, create);
router.get("/book", list);
router.get("/book/:id", read);

router.put("/book/:id", upload, update);
router.delete("/book/:id", remove);

module.exports = router;
