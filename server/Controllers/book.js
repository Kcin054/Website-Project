const Book = require("../Models/Book");
const fs = require("fs");
const path = require("path");

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
    let imageFileName = "noimage.jpg";
    if (req.files && req.files.file && req.files.file.length > 0) {
      imageFileName = req.files.file[0].filename;
    }

    let pdfFileName = null;
    if (req.files && req.files.pdfFile && req.files.pdfFile.length > 0) {
      pdfFileName = req.files.pdfFile[0].filename;
    }

    const newBook = new Book({
      ...req.body,
      file: imageFileName,
      pdfFile: pdfFileName,
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    console.error("Error creating book:", error);
    if (req.files && req.files.file && req.files.file.length > 0) {
      const fs = require("fs");
      const path = require("path");
      fs.unlink(
        path.join(__dirname, "../uploads/images", req.files.file[0].filename),
        (err) => {
          if (err) console.error("Failed to delete uploaded image file:", err);
        }
      );
    }
    if (req.files && req.files.pdfFile && req.files.pdfFile.length > 0) {
      const fs = require("fs");
      const path = require("path");
      fs.unlink(
        path.join(__dirname, "../uploads/pdfs", req.files.pdfFile[0].filename),
        (err) => {
          if (err) console.error("Failed to delete uploaded PDF file:", err);
        }
      );
    }
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการสร้างหนังสือ",
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    let newData = { ...req.body };

    const oldBook = await Book.findById(id).exec();
    if (!oldBook) {
      return res.status(404).json({ message: "ไม่พบหนังสือที่ต้องการอัปเดต" });
    }

    if (req.files && req.files.file && req.files.file.length > 0) {
      const newImageFileName = req.files.file[0].filename;
      newData.file = newImageFileName;

      if (oldBook.file && oldBook.file !== "noimage.jpg") {
        const oldImagePath = path.join(
          __dirname,
          "../uploads/images",
          oldBook.file
        );
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error("Failed to delete old image file:", err);
          } else {
            console.log("Old image file removed successfully:", oldBook.file);
          }
        });
      }
    } else if (
      req.body.file === "noimage.jpg" &&
      oldBook.file !== "noimage.jpg"
    ) {
      const oldImagePath = path.join(
        __dirname,
        "../uploads/images",
        oldBook.file
      );
      fs.unlink(oldImagePath, (err) => {
        if (err)
          console.error(
            "Failed to delete old image file (noimage.jpg case):",
            err
          );
        else
          console.log(
            "Old image file removed successfully (noimage.jpg case):",
            oldBook.file
          );
      });
      newData.file = "noimage.jpg";
    }

    if (req.files && req.files.pdfFile && req.files.pdfFile.length > 0) {
      const newPdfFileName = req.files.pdfFile[0].filename;
      newData.pdfFile = newPdfFileName;

      if (oldBook.pdfFile) {
        const oldPdfPath = path.join(
          __dirname,
          "../uploads/pdfs",
          oldBook.pdfFile
        );
        fs.unlink(oldPdfPath, (err) => {
          if (err) {
            console.error("Failed to delete old PDF file:", err);
          } else {
            console.log("Old PDF file removed successfully:", oldBook.pdfFile);
          }
        });
      }
    } else if (req.body.pdfFile === "" && oldBook.pdfFile) {
      const oldPdfPath = path.join(
        __dirname,
        "../uploads/pdfs",
        oldBook.pdfFile
      );
      fs.unlink(oldPdfPath, (err) => {
        if (err)
          console.error("Failed to delete old PDF file (empty case):", err);
        else
          console.log(
            "Old PDF file removed successfully (empty case):",
            oldBook.pdfFile
          );
      });
      newData.pdfFile = "";
    }

    const updated = await Book.findOneAndUpdate({ _id: id }, newData, {
      new: true,
    }).exec();

    res.send(updated);
  } catch (err) {
    console.error("Error updating book:", err);
    if (req.files && req.files.file && req.files.file.length > 0) {
      fs.unlink(
        path.join(__dirname, "../uploads/images", req.files.file[0].filename),
        (unlinkErr) => {
          if (unlinkErr)
            console.error(
              "Failed to delete newly uploaded image file on update error:",
              unlinkErr
            );
        }
      );
    }
    if (req.files && req.files.pdfFile && req.files.pdfFile.length > 0) {
      fs.unlink(
        path.join(__dirname, "../uploads/pdfs", req.files.pdfFile[0].filename),
        (unlinkErr) => {
          if (unlinkErr)
            console.error(
              "Failed to delete newly uploaded PDF file on update error:",
              unlinkErr
            );
        }
      );
    }
    res.status(500).send("Server Error: " + err.message);
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
