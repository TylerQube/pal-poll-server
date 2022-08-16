const express = require("express");
const router = express.Router();
const passwordResetController = require("../controller/passwordResetController");

router.post("/", passwordResetController.sendResetEmail);

module.exports = router;