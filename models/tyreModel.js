const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;

const tyreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    srednica: {
      type: Number,
      required: true,
    },
    profil: {
      type: Number,
      required: true,
    },
    szerokosc: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    sezon: {
      type: String,
      required: true,
      enum: ["lato", "zima", "allseason"],
    },
    type: {
      type: String,
      required: true,
      lowercase: true,
      enum: ["nowa", "bieznikowana"],
    },
    clas: {
      type: String,
      required: true,
      lowercase: true,
      enum: ["terenowa", "samochodowa", "wzmacniana"],
    },
    image: [String],
    imageCover: [String],
    price: { type: Number, required: true },
    producent: { type: ObjectId, ref: "Producent", required: true },
    indeks: {
      type: String,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model("Tyre", tyreSchema);
