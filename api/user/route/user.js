const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const auth = require("../../../config/auth");

router.post("/register", userController.registerNewUser);
router.post("/login", userController.loginUser);
router.get("/me", auth.authUser, userController.getUserDetails);

module.exports = router;