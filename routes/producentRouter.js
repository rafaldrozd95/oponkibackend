const express = require("express");
const { createProducent } = require("../controllers/producentController");
const fileUpload = require("../middlewares/file-upload");

router.post("/", fileUpload.single("producentImage"), createProducent);

module.exports = router;
