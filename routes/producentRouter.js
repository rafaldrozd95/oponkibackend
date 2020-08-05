const express = require("express");
const { createProducent } = require("../controllers/producentController");
const fileUpload = require("../middlewares/file-upload");
const router = express.Router();
router.post("/", fileUpload.single("producentImage"), createProducent);

module.exports = router;
