const mongoose = require("mongoose");
const validator = require("validator");

const ObjectId = mongoose.Schema.ObjectId;
const orderSchema = new mongoose.Schema(
  {
    opona: {
      type: ObjectId,
      ref: "Tyre",
      required: true,
    },
    email: {
      type: String,
      required: true,
      validate: validator.isEmail,
    },
    adres: {
      type: String,
      required: true,
    },
    dostawa: {
      type: String,
      required: true,
    },
    ile: {
      type: Number,
      required: true,
    },
    postal: {
      type: String,
      required: true,
    },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    relised: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("Order", orderSchema);
