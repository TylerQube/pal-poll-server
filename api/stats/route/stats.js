const express = require("express");
const router = express.Router();
const statsController = require("../controller/statsController");
const auth = require("../../../config/auth");

router.get("/get/:relativeIndex", auth.authUser, statsController.getStats);

module.exports = router;