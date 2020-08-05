const express = require("express");
const router = express.Router();
const { isVerified, isAdmin } = require("../controllers/authController");

const {
  getTyres,
  createTyre,
  getTyreById,
  deleteTyreById,
  updateTyreById,
} = require("../controllers/tyreController");

const fileUpload = require("../middlewares/file-upload");

router.get("/", getTyres);
router.get("/:tid", getTyreById);
router.delete("/:tid", isVerified, isAdmin, deleteTyreById);
router.patch("/:tid", isVerified, isAdmin, updateTyreById);

router.post(
  "/",
  isVerified,
  isAdmin,
  fileUpload.fields([
    { name: "image", maxCount: 4 },
    { name: "imageCover", maxCount: 1 },
  ]),
  createTyre
);
module.exports = router;
