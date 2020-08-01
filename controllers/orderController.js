const Order = require("../models/orderModel");
const Tyre = require("../models/tyreModel");
const HttpError = require("./httpError");
const nodemailer = require("nodemailer");

exports.createOrder = async (req, res, next) => {
  const tid = req.params.tid;
  const { adres, city, dostawa, email, ile, phone, postal } = req.body;
  if (!adres || !city || !dostawa || !email || !ile || !phone || !postal) {
    return next(new HttpError("Nie podano wszystkich danych", 404));
  }
  const order = new Order({
    adres,
    city,
    dostawa,
    email,
    ile,
    phone,
    postal,
    opona: tid,
  });
  try {
    let opona = await Tyre.findById(tid);
    let transporter = nodemailer.createTransport({
      host: "mail.privateemail.com",
      port: 465,
      secure: true,
      auth: {
        user: "kontakt@oponydrozd.com",
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    let info = await transporter.sendMail({
      from: "kontakt@oponydrozd.com", //
      to: email,
      subject: "Potwierdzenie zakupu opon OponyDrozd.com",
      text: "",
      html: `<h1>Szanowni Państwo</h1>
            <h2>Dziękujemy za zakup opon ${
              opona.name
            } w ilości sztuk ${ile}</h2>
            <h2>Całkowita kwota do zapłaty to ${ile * opona.price}.00PLN.<h2>
            <h3>Informujemy, że zlecenie zostało przyjęte do realizacji.</h3>
            <h4>W razie wątpliwości co do poprawności zamówienia, skontaktuje się z Państwem nasz konsultant.</h4>
            <h4>Z wyrazami szacunku,</h4>
            <h4>OponyDrozd.com</h4>
            <a href="https://oponydrozd.com">OponyDrozd.com</a>
      `,
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    await order.save();
    res.status(200).json({ order });
  } catch (err) {
    return next(new HttpError("Nie udalo sie zlozyc zamowienia", 404));
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort("-createdAt")
      .populate({ path: "opona", select: "-imageCover -image" });
    res.status(200).json({ orders });
  } catch (err) {
    return new HttpError("Nie udalo sie wyswietlic zamowien", 404);
  }
};

exports.deleteOrderById = async (req, res, next) => {
  const oid = req.params.oid;
  try {
    const order = await Order.findByIdAndDelete(oid);
  } catch (err) {
    return next(new HttpError("Nie udalo sie usunac", 402));
  }
  res.json({ ok: "ok" });
};

exports.updateOrderById = async (req, res, next) => {
  const oid = req.params.oid;
  try {
    const order = await Order.findByIdAndUpdate(oid, req.body);
    res.status(200).json(order);
  } catch (err) {
    return next(new HttpError("Nie udalo sie zaktualizowac", 402));
  }
};
