const mongoose = require("mongoose");
const Config = require('./Config');
const AnswerOptions = require('./AnswerOptions');

const questionSchema = mongoose.Schema({
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
    answerOptions: {
        type: [AnswerOptions.answerOptionSchema],
        // must provide at least 2 answer options
        validate: val => { return val.length >= 2 },
        required: [true, "Include an array of answer options"]
    },
    answerNumber: {
        type: Number,
        // validate: num => { return 0 <= num < this.answerOptions.length }
    }
});

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;