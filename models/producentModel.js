const mongoose = require("mongoose");

const producentModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: String,
});

module.exports = mongoose.model("Producent", producentModel);
