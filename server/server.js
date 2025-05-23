require("dotenv").config();

const express = require("express");
const { readdirSync } = require("fs");
// const bookRouters = require('./Routes/book')
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const bodyParse = require("body-parser");
mongoose.set("strictPopulate", false); // <-- เพิ่มบรรทัดนี้

const connectDB = require("./Config/db");

const app = express();

connectDB();

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParse.json({ limit: "10mb" }));
app.use("/img", express.static("uploads"));

// app.use('/api', bookRouters)

readdirSync("./Routes").map((r) => app.use("/api", require("./Routes/" + r)));

app.listen(5000, () => console.log("Server running on port 5000"));
