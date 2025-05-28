const Book = require("../Models/Book");
const fs = require("fs"); // เพิ่มบรรทัดนี้
const path = require("path"); // เพิ่มบรรทัดนี้

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

// exports.create = async (req, res) => {
//   try {
//     var data = req.body;
//     if (req.file) {
//       data.file = req.file.filename;
//     }
//     const booked = await Book(data).save();
//     res.send(booked);
//   } catch (err) {
//     console.log(err);
//     res.status(500).send("Server Error");
//   }
// };

exports.create = async (req, res) => {
  try {
    // ตรวจสอบว่ามีการอัปโหลดไฟล์รูปภาพปกหรือไม่
    let imageFileName = "noimage.jpg";
    if (req.files && req.files.file && req.files.file.length > 0) {
      imageFileName = req.files.file[0].filename;
    }

    // ตรวจสอบว่ามีการอัปโหลดไฟล์ PDF (สำหรับ E-book) หรือไม่
    let pdfFileName = null; // กำหนดค่าเริ่มต้นเป็น null
    if (req.files && req.files.pdfFile && req.files.pdfFile.length > 0) {
      pdfFileName = req.files.pdfFile[0].filename; // ดึงชื่อไฟล์ PDF จริงที่ Multer สร้างขึ้น
    }

    // สร้างข้อมูลหนังสือใหม่
    const newBook = new Book({
      ...req.body, // ข้อมูลอื่นๆ จากฟอร์ม (รวมถึง isEbook จาก req.body)
      file: imageFileName, // ชื่อไฟล์ภาพปก
      pdfFile: pdfFileName, // <--- UNCOMMENT และใช้ตัวแปร pdfFileName ที่สร้างขึ้น
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    console.error("Error creating book:", error);
    // อย่าลืมลบไฟล์ที่อัปโหลดไปแล้วถ้ามีข้อผิดพลาดในการบันทึกลง DB
    if (req.files && req.files.file && req.files.file.length > 0) {
      // ตรวจสอบให้แน่ใจว่าได้ import 'fs' และ 'path' ที่ด้านบนของไฟล์ Controller นี้
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
    let newData = { ...req.body }; // สร้างสำเนาของ req.body

    // ดึงข้อมูลหนังสือเดิมก่อน เพื่อเอาชื่อไฟล์เก่ามาลบ
    const oldBook = await Book.findById(id).exec();
    if (!oldBook) {
      return res.status(404).json({ message: "ไม่พบหนังสือที่ต้องการอัปเดต" });
    }

    // --- จัดการไฟล์รูปภาพปก (fieldname: "file") ---
    if (req.files && req.files.file && req.files.file.length > 0) {
      const newImageFileName = req.files.file[0].filename;
      newData.file = newImageFileName; // อัปเดตชื่อไฟล์รูปภาพใหม่ใน newData

      // ลบไฟล์รูปภาพเก่า ถ้ามีและไม่ใช่ noimage.jpg
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
      // กรณีที่ Frontend ส่งมาว่าไม่มีรูปภาพปก และของเดิมมี
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
      newData.file = "noimage.jpg"; // ตั้งค่ากลับเป็น noimage.jpg
    }

    // --- จัดการไฟล์ PDF (fieldname: "pdfFile") ---
    if (req.files && req.files.pdfFile && req.files.pdfFile.length > 0) {
      const newPdfFileName = req.files.pdfFile[0].filename;
      newData.pdfFile = newPdfFileName; // อัปเดตชื่อไฟล์ PDF ใหม่ใน newData

      // ลบไฟล์ PDF เก่า ถ้ามี
      if (oldBook.pdfFile) {
        // ตรวจสอบว่ามี pdfFile ใน DB หรือไม่
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
      // กรณีที่ Frontend ส่งมาว่าไม่มีไฟล์ PDF และของเดิมมี
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
      newData.pdfFile = ""; // ตั้งค่ากลับเป็นค่าว่าง
    }

    const updated = await Book.findOneAndUpdate({ _id: id }, newData, {
      new: true, // คืนค่า Document ที่อัปเดตแล้ว
    }).exec();

    res.send(updated);
  } catch (err) {
    console.error("Error updating book:", err); // เปลี่ยน console.log เป็น console.error เพื่อให้เห็นชัดเจน
    // ลบไฟล์ที่อัปโหลดใหม่ไปแล้วหากเกิดข้อผิดพลาดในการบันทึกลง DB
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
    res.status(500).send("Server Error: " + err.message); // ส่ง error message กลับไปให้ Frontend เห็นด้วย
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
