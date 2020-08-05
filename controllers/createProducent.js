const Producent = require("../models/producentModel");

exports.createTyre = async (req, res, next) => {
  const { name } = req.body;

  const image = req.files.producentImage.path.split("/").slice(3).join("/");

  let producent;
  try {
    producent = new Producent({
      name,
      image,
    });
    await producent.save();

    res.status(200).json({ producent });
  } catch (err) {
    return next(new HttpError(err.message, 432));
  }
};
