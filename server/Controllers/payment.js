exports.processPayment = async (req, res) => {
  try {
    const { paymentMethod, amount, currency, orderId } = req.body;
    const userId = req.user._id;

    console.log("กำลังประมวลผลการชำระเงินสำหรับผู้ใช้:", userId);
    console.log("วิธีการชำระเงิน:", paymentMethod);
    console.log("จำนวนเงิน:", amount);
    console.log("สกุลเงิน:", currency);
    console.log("หมายเลขคำสั่งซื้อ:", orderId);
    setTimeout(() => {
      res.json({ message: "การชำระเงินสำเร็จ (จำลอง)" });
    }, 2000);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการประมวลผลการชำระเงิน:", error);
    res.status(500).json({ message: error.message });
  }
};
