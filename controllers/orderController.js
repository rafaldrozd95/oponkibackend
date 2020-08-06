const Order = require("../models/orderModel");
const Tyre = require("../models/tyreModel");
const HttpError = require("./httpError");
const nodemailer = require("nodemailer");
const Przelewy24 = require("../middlewares/paymentController");

async function createPayment(
  id,
  pos,
  salt,
  status,
  price,
  desc,
  email,
  orderid
) {
  const P24 = new Przelewy24(id, pos, salt, status);
  P24.setSessionId(orderid);
  P24.setAmount(price * 100);
  P24.setCurrency("PLN");
  P24.setDescription(desc);
  P24.setEmail(email);
  P24.setCountry("PL");
  P24.setUrlStatus("http://46.101.243.96/api/order/confirmpayment");
  P24.setUrlReturn("https://oponydrozd.com/paymentConfirmed");

  // What about adding some products?
  P24.addProduct("Product no.1", "Product description", 1, 1.2 * 100);
  P24.addProduct("Product no.2", null, 2, 5 * 100);
  P24.addProduct("Product no.3", null, 1, 9.2 * 100, "20202");

  // Register our order
  try {
    const token = await P24.register();
    const url = P24.getPayByLinkUrl(token);

    return url;
  } catch (e) {}
}

exports.createOrder = async (req, res, next) => {
  const tid = req.params.tid;
  const {
    adres,
    city,
    dostawa,
    email,
    ile,
    phone,
    postal,
    imieinazwisko,
  } = req.body;
  if (
    !adres ||
    !city ||
    !dostawa ||
    !email ||
    !ile ||
    !phone ||
    !postal ||
    !imieinazwisko
  ) {
    return next(new HttpError("Nie podano wszystkich danych", 404));
  }
  let transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
      user: "kontakt@oponydrozd.com",
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const order = new Order({
    imieinazwisko,
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
    let url;
    let opona = await Tyre.findById(tid);

    await transporter.sendMail({
      from: "kontakt@oponydrozd.com", //
      to: email,
      subject: "[Potwierdzenie zakupu] OponyDrozd.com",
      text: "",
      html: `<h1>Szanowni Państwo</h1>
            <h2>Dziękujemy za zakup opon ${
              opona.name
            } w ilości sztuk ${ile}</h2>
            <h2>Całkowita kwota do zapłaty to <b>${
              ile * opona.price
            }</b>.00PLN.<h2>
            <h3>Informujemy, że zlecenie zostało przyjęte do realizacji.</h3>
            <h4>W razie wątpliwości co do poprawności zamówienia, skontaktuje się z Państwem nasz konsultant.</h4>
            <h4>Z wyrazami szacunku,</h4>
            <h5>Adres wysyłki:</h5>
            <h5>${imieinazwisko}</h5>
            <h5>${adres}, ${postal}, ${city} </h5>
            <h4>OponyDrozd.com</h4>
            <a href="https://oponydrozd.com">OponyDrozd.com</a>
            <h5><img src=https://oponydrozd.com/uploads/images/jander.png alt="OPONY JAND"/></h5>
      `,
    });

    if (dostawa == "P24") {
      const price = ile * opona.price;
      url = await createPayment(
        119910,
        119910,
        "bfab0832d2c1f382",
        true,
        ile * opona.price,
        `${opona.name}, ${ile}, ${price}`,
        email,
        order._id.toString()
      );
    }

    await order.save();
    return res.status(200).json({ url });
  } catch (err) {
    return next(new HttpError(err, 404));
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
