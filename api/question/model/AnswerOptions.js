const mongoose = require('mongoose');

// schema sourced from: https://stackoverflow.com/questions/52215512/mongodb-schema-design-for-multpile-choice-questions-and-answers
exports.answerOptionSchema = mongoose.Schema({
    optionNumber: {
        type: Number
    },
    answerBody: {
        type: String,
        minlength: 1,
        maxlength: 200,
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
});