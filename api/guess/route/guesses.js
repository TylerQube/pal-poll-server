const express = require("express");
const router = express.Router();
const guessController = require("../controller/guessController");
const auth = require("../../../config/auth");

router.post("/submit", auth.authUser, guessController.submitGuess);

module.exports = router;