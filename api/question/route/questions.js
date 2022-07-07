const express = require("express");
const router = express.Router();
const questionController = require("../controller/questionController");
const auth = require("../../../config/auth");

router.get("/daily", auth.authUser, questionController.getDailyQuestion);
router.post("/add", auth.authUser, auth.adminAuth, questionController.addQuestion)
router.post("/update", auth.authUser, auth.adminAuth, questionController.editQuestion)
router.post("/delete", auth.authUser, auth.adminAuth, questionController.deleteQuestion);
router.post("/order", auth.authUser, auth.adminAuth, questionController.changeOrder);


router.get("/get/:startIndex/:num", auth.authUser, auth.adminAuth, (req, res) => { 
    questionController.getQuestions(req, res, req.params.startIndex, req.params.num); 
})

module.exports = router;