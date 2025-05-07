const Book = require("../Models/Book");
const fs = require("fs");

exports.read = async (req, res) => {
  try {
    const id = req.params.id;
    const bookList = await Book.findOne({ _id: id }).exec();
    res.send(bookList);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.list = async (req, res) => {
  try {
    const bookList = await Book.find({}).exec();
    res.send(bookList);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.create = async (req, res) => {
  try {
    var data = req.body;
    if (req.file) {
      data.file = req.file.filename;
    }
    const booked = await Book(data).save();
    res.send(booked);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    var newData = req.body;
    if (typeof req.file !== "undefined") {
      newData.file = req.file.filename;
      await fs.unlink("./uploads/" + newData.fileOld, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Remove Success");
        }
      });
    }
    const updated = await Book.findOneAndUpdate({ _id: id }, newData, {
      new: true,
    }).exec();
    res.send(updated);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    const removed = await Book.findOneAndDelete({ _id: id }).exec();

    if (removed?.file) {
      await fs.unlink("./uploads/" + removed.file, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Remove Success");
        }
      });
    }

    res.send(removed);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};
