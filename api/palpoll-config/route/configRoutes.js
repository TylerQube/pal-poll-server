const express = require("express");
const router = express.Router();
const configController = require("../controller/configController");
const auth = require("../../../config/auth");

router.get("/get", auth.authUser, auth.adminAuth, configController.getConfig)

module.exports = router;