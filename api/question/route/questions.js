const express = require("express");
const router = express.Router();
const questionController = require("../controller/questionController");
const auth = require("../../../config/auth");

router.get("/daily", auth.authUser, questionController.getDailyQuestion);
router.post("/add", auth.authUser, auth.adminAuth, questionController.addQuestion)
router.post("/edit", auth.authUser, auth.adminAuth, questionController.editQuestion)

router.get("/get/:startIndex/:num", auth.authUser, auth.adminAuth, (req, res) => { 
    questionController.getQuestions(req, res, req.params.startIndex, req.params.num); 
})

module.exports = router;