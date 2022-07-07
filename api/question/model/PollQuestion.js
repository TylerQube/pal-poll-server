const mongoose = require("mongoose");

const pollQuestionSchema = mongoose.Schema({
    questionBody: {
        type: String,
        minlength: 1,
        maxlength: 10000,
        required: [true, "Include a question"]
    },
    // Question numbers are 0 indexed
    orderNum: {
        type: Number,
        required: [true, "Specify an order in the question sequence"]
    },
});

const PollQuestion = mongoose.model("PollQuestion", pollQuestionSchema, "questions");
module.exports = PollQuestion;