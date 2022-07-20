const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const auth = require("../../../config/auth");
const multer  = require('multer')
const upload = multer()

router.post("/register", userController.registerNewUser);
router.post("/login", userController.loginUser);
router.get("/me", auth.authUser, userController.getUserDetails);
router.post("/updateinfo", auth.authUser, userController.updateUserDetails);
router.post("/updatepfp", auth.authUser, upload.single('avatar'), userController.updateProfilePicture);

router.get("/avatar", userController.getUserAvatar);

router.get("/adminAuth", auth.authUser, auth.adminAuth, (req, res) => { res.status(200).json({ message : "Admin authenticated" }) });

module.exports = router;