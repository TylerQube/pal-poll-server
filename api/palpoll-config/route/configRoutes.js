const express = require("express");
const router = express.Router();
const configController = require("../controller/configController");
const auth = require("../../../config/auth");

router.get("/get", auth.authUser, auth.adminAuth, configController.getConfig)
router.post("/update", auth.authUser, auth.adminAuth, configController.updateStartDate)

module.exports = router;