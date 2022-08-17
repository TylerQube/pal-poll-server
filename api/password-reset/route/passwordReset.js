const express = require("express");
const router = express.Router();
const passwordResetController = require("../controller/passwordResetController");

const rateLimit = require('express-rate-limit')

const emailLimiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const resetLimiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	max: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

router.post("/", emailLimiter, passwordResetController.sendResetEmail);
router.post("/submit", resetLimiter, passwordResetController.resetPassword);

router.get("/verify/:token", passwordResetController.verifyResetToken);


module.exports = router;