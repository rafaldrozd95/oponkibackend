const express = require("express");
const { isVerified, isAdmin } = require("../controllers/authController");

const {
  createOrder,
  getAllOrders,
  deleteOrderById,
  updateOrderById,
} = require("../controllers/orderController");
const router = express.Router();

router.post("/:tid", createOrder);
router.delete("/:oid", isVerified, isAdmin, deleteOrderById);
router.patch("/:oid", isVerified, isAdmin, updateOrderById);
router.get("/", getAllOrders);

module.exports = router;
