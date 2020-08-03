const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const mongoSanitize= require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require("cors");
require("dotenv").config();
const HttpError = require("./controllers/httpError");
app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use(bodyParser.json());
app.use(cors());
app.use(mongoSanitize());
app.use(xss());
const orderRouter = require("./routes/orderRouter");
const tyreRouter = require("./routes/tyreRouter");
const userRouter = require("./routes/authRouter");
app.use("/api/tyres", tyreRouter);
app.use("/api/order", orderRouter);
app.use("/api/users", userRouter);
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});
app.use((error, req, res, next) => {
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error occured" });
});
const DB = process.env.MONGO_URI;
const port = process.env.PORT || 8000;
mongoose.connect(
  DB,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
  },
  () => {
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  }
);
