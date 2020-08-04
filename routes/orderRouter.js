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
  const P24 = new Przelewy24("119910", "119910", "afc308b6ad85f834", true);

  P24.setSessionId("nodeapitest1");
  P24.setAmount(5.2 * 100);
  P24.setCurrency("PLN");
  P24.setDescription("Simple yyy.");
  P24.setEmail("test@gmail.com");
  P24.setCountry("PL");
  P24.setUrlStatus("http://localhost:8000/api/order/confirmPayment");
  P24.setUrlReturn("https://oponydrozd.com");

  P24.addProduct("Product no.1", "Product description", 1, 1.2 * 100);
  P24.addProduct("Product no.2", null, 2, 5 * 100);
  P24.addProduct("Product no.3", null, 1, 9.2 * 100, "20202");

  try {
    const token = await P24.register();
    const url = P24.getPayByLinkUrl(token);

    console.log(url);
    res.json({ url });
  } catch (e) {
    console.log(e.message);
  }
});
router.post("/confirmPayment", confirmPayment);

router.post("/:tid", createOrder);
router.delete("/:oid", isVerified, isAdmin, deleteOrderById);
router.patch("/:oid", isVerified, isAdmin, updateOrderById);
router.get("/", getAllOrders);

module.exports = router;
