const express = require("express");
const {
  isVerified,
  isAdmin,
  confirmPayment,
} = require("../controllers/authController");
const Przelewy24 = require("../middlewares/paymentController");
const {
  createOrder,
  getAllOrders,
  deleteOrderById,
  updateOrderById,
} = require("../controllers/orderController");
const router = express.Router();
router.post("/payment", async (req, res, next) => {
  const P24 = new Przelewy24(119910, 119910, "bfab0832d2c1f382", false);

  P24.setSessionId("31231");
  P24.setAmount(10);
  P24.setCurrency("PLN");
  P24.setDescription("Simple payment.");
  P24.setEmail("rafaldrozd95@gmail.com");
  P24.setCountry("PL");
  P24.setUrlStatus("http://46.101.243.96/api/order/confirmPayment");
  P24.setUrlReturn("https://oponydrozd.com");

  try {
    const token = await P24.register();
    const url = P24.getPayByLinkUrl(token);

    console.log(url);
    res.json({ url });
  } catch (e) {
    console.log(e.message);
    return next(new Error(e.message));
  }
});
router.post("/confirmPayment", confirmPayment);

router.post("/:tid", createOrder);
router.delete("/:oid", isVerified, isAdmin, deleteOrderById);
router.patch("/:oid", isVerified, isAdmin, updateOrderById);
router.get("/", getAllOrders);

module.exports = router;
