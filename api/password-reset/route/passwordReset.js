const express = require("express");
const router = express.Router();
const passwordResetController = require("../controller/passwordResetController");

router.post("/", passwordResetController.sendResetEmail);
router.post("/submit", passwordResetController.resetPassword);

router.get("/verify/:token", passwordResetController.verifyResetToken);


module.exports = router;