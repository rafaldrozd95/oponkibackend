const Tyre = require("../models/tyreModel");
const HttpError = require("./httpError");
const fs = require("fs");
const path = require("path");

exports.getTyres = async (req, res, next) => {
  const {
    clas = undefined,
    description = undefined,
    name = undefined,
    price = undefined,
    profil = undefined,
    sezon = undefined,
    szerokosc = undefined,
    srednica = undefined,
    type = undefined,
  } = req.query;
  const sortBy = req.query.sorty
    ? req.query.sorty === "up"
      ? "price"
      : "-price"
    : "price";

  const limit = 12;
  const page = +req.query.page;
  const skip = (page - 1) * limit;
  try {
    const tyres = await Tyre.find({
      srednica:
        srednica == "undefined" ? { $in: [13, 14, 15, 16, 17, 18] } : srednica,
      szerokosc: szerokosc == "undefined" ? { $gte: 0, $lte: 265 } : szerokosc,
      profil: profil == "undefined" ? { $gte: 0, $lte: 100 } : profil,
      clas:
        clas == "undefined"
          ? { $in: ["terenowa", "wzmacniana", "samochodowa"] }
          : clas,
      type: type == "undefined" ? { $in: ["nowa", "bieznikowana"] } : type,
      sezon:
        sezon == "undefined" ? { $in: ["lato", "zima", "allseason"] } : sezon,
    })
      .sort(sortBy)
      .skip(skip)
      .limit(limit);
    res.status(200).json({
      tyres,
    });
  } catch (err) {
    return next(new HttpError(err.message, 402));
  }
};

exports.createTyre = async (req, res, next) => {
 const {
    year,
    clas,
    description,
    name,
    price,
    profil,
    sezon,
    srednica,
    szerokosc,
    type,
  } = req.body;
  const images = req.files.image.map((el) => el.path.split('/').slice(3).join('/'));
  const imageCover = req.files.imageCover[0].path.split('/').slice(3).join('/');
  let tyre;
  try {
    tyre = new Tyre({
      year,
      clas,
      description,
      name,
      price,
      profil,
      sezon,
      srednica,
      szerokosc,
      type,
      image: images,
      imageCover,
    });
    await tyre.save();

    res.status(200).json({ tyre });
  } catch (err) {
    return next(new HttpError(err.message, 432));
  }
};
exports.getTyreById = async (req, res, next) => {
  const tid = req.params.tid;
  try {
    const tyre = await Tyre.findById(tid);
    res.status(200).json({ tyre });
  } catch (err) {
    return next(new HttpError("Nie udalo sie znalesc opony", 404));
  }
};
exports.deleteTyreById = async (req, res, next) => {
  const tid = req.params.tid;
  try {
    const tyre = await Tyre.findByIdAndDelete(tid);
  } catch (err) {
    return next(new HttpError("Nie udalo sie usunac", 402));
  }
  res.json({ ok: "ok" });
};

exports.updateTyreById = async (req, res, next) => {
  const tid = req.params.tid;
  const { price } = req.body;
  try {
    await Tyre.findByIdAndUpdate(tid, req.body);
  } catch (err) {
    return next(new HttpError("Nie udalo sie zmienic ceny", 402));
  }
  res.json({ ok: "ok" });
};
