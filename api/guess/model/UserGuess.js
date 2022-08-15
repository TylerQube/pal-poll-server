const mongoose = require('mongoose');

const quizGuessSchema = mongoose.Schema({
  userId: {
    type: String,
    required: [true, "Specify a user"]
  },
  questionId: {
    type: String,
    required: [true, "Specify a question ID"]
  },
  timeElapsed: {
    type: Number,
    required: [true, "Include time spent guessing"]
  },
  answerOptionId: {
    type: String,
    required: [true, "Include answer ID"]
  },
  isCorrect: {
    type: Boolean,
    required: [true, "Include whether the guess is correct"]
  }
});

const quizFailSchema = mongoose.Schema({
  userId: {
    type: String,
    required: [true, "Specify a user"]
  },
  questionId: {
    type: String,
    required: [true, "Specify a question ID"]
  },
  timeElapsed: {
    type: Number,
    required: [true, "Include time spent guessing"]
  },
  isCorrect: {
    type: Boolean,
    required: [true, "Include whether the guess is correct"]
  }
});

const QuizGuess = mongoose.model("UserGuess", quizGuessSchema, "quizGuesses");
exports.QuizGuess = QuizGuess;

const QuizFail = mongoose.model("QuizFail", quizFailSchema, "quizGuesses");
exports.QuizFail = QuizFail;

const pollVoteSchema = mongoose.Schema({
  userId: {
    type: String,
    required: [true, "Specify a user"]
  },
  questionId: {
    type: String,
    required: [true, "Specify a question ID"]
  },
  timeElapsed: {
    type: Number,
    required: [true, "Include time spent guessing"]
  },
  guessContent: {
    type: String,
    required: [true, "Include guess content"]
  },
});

const PollVote = mongoose.model("PollVote", pollVoteSchema, "pollVotes");
exports.PollVote = PollVote;