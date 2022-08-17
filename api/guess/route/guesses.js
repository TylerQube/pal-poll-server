const express = require("express");
const router = express.Router();
const guessController = require("../controller/guessController");
const auth = require("../../../config/auth");

const rateLimit = require('express-rate-limit');

const guessLimiter = rateLimit({
	windowMs: 24 * 60 * 60 * 1000, // 10 minutes
	max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

router.post("/submit", guessLimiter, auth.authUser, guessController.submitGuess);

module.exports = router;