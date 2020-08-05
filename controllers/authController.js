const User = require("../models/userModel");
const HttpError = require("./httpError");
const jwt = require("jsonwebtoken");
const Przelewy24 = require("../middlewares/paymentController");

exports.signUp = async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });
  try {
    user.save();
    res.status(200).json({ user });
  } catch (err) {
    return next(new HttpError("nie udalo sie zalozyc konta", 404));
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  let user;
  try {
    user = await User.findOne({ email }).select("+password");
  } catch (err) {
    return next(new HttpError("Something went wrong", 402));
  }

  if (!user) {
    return next(new HttpError("Login i haslo nei pasuja do siebie", 402));
  }
  const isValid = await user.checkPassword(password, user.password);
  if (!isValid) {
    return next(new HttpError("Zly login lub haslo", 403));
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1y",
  });
  res.status(200).json({ status: "ok", token, id: user._id, role: user.role });
};
exports.isVerified = (req, res, next) => {
  let isValid;
  try {
    const token = req.headers.authorization.split(" ")[1];
    isValid = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new HttpError("Uzytkownik nie zweryfikowany", 403));
  }
  req.decodedId = isValid.id;
  next();
};
exports.isAdmin = async (req, res, next) => {
  const id = req.decodedId;
  try {
    const user = await User.findById(id);
    if (!user || user.role !== "admin") {
      return next(new HttpError("Nie udalo sie zautoryzowac", 402));
    }
  } catch (err) {
    return next(new HttpError("Nie udalo sie zweryfikowac administracji", 402));
  }
  next();
};

const P24_TRUST_IPS = [
  "91.216.191.181",
  "91.216.191.182",
  "91.216.191.183",
  "91.216.191.184",
  "91.216.191.185",
];
exports.confirmPayment = async (req, res, next) => {
  if (P24_TRUST_IPS.indexOf(req.headers["x-real-ip"]) === -1) {
    return next(new Error("Unauthorized IP address"));
  }
  const {
    p24_session_id,
    p24_amount,
    p24_currency,
    p24_order_id,
    p24_sign,
  } = req.body;
  console.log(req.body);
  const P24 = new Przelewy24(119910, 119910, "bfab0832d2c1f382", true);

  P24.setSessionId(p24_session_id);
  P24.setAmount(p24_amount);
  P24.setCurrency(p24_currency);
  P24.setOrderId(p24_order_id);

  try {
    await P24.verify(p24_sign);

    return res.send("OK");
  } catch (e) {
    return next(e);
  }
};
