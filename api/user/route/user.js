const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const auth = require("../../../config/auth");
const multer  = require('multer')
const upload = multer()

const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 15 minutes
	max: 20, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

router.post("/register", userController.registerNewUser);
router.post("/login", loginLimiter, userController.loginUser);
router.get("/me", auth.authUser, userController.getUserDetails);
router.post("/updateinfo", auth.authUser, userController.updateUserDetails);
router.post("/updatepfp", auth.authUser, upload.single('avatar'), userController.updateProfilePicture);

router.get("/avatar", userController.getUserAvatar);

router.get("/userAuth", auth.authUser, (req, res) => { res.status(200).json({ message : "User authenticated" }) });


router.get("/adminAuth", auth.authUser, auth.adminAuth, (req, res) => { res.status(200).json({ message : "Admin authenticated" }) });

module.exports = router;