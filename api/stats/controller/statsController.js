const PollQuestion = require('../../question/model/PollQuestion');
const Question = require('../../question/model/Question');
const Config = require('../../palpoll-config/model/Config');
const User = require('../../user/model/User');
const AnswerOptions = require('../../question/model/AnswerOptions')
const questionController = require('../../question/controller/questionController');
const { QuizGuess, PollVote } = require('../../guess/model/UserGuess');

// get stats from one question
// returns questions and all guess/votes
exports.getStats = async (req, res) => {
    try {
        const relativeIndex = parseInt(req.params.relativeIndex);
        if(relativeIndex > 0)  {
            return res.status(400).json({
                error: new Error('Cannot fetch stats of unplayed question')
            })
        }

        const config = await Config.getSingletonConfig();
        const startDate = config.startDate;

        const daysSinceStart = Math.floor(questionController.daysSince(startDate));

        const questionIndex = daysSinceStart + relativeIndex;
        console.log("GETTING QUESTION INDEX: " + questionIndex)

        let question = await Question.findOne({ orderNum : questionIndex }) 
        if(!question) question = await PollQuestion.findOne({ orderNum : questionIndex });
        // console.log("Index " + relativeIndex + " here is the question: ")
        // console.log(question)
        console.log(question);
        if(!question) {
            return res.status(404).json({
                err: "Question not found"
            })
        }

        const isQuiz = question.answerOptions && question.answerOptions.length > 0;
        let attempts;
        if(isQuiz) {
            // Question is a quiz
            attempts = await QuizGuess.find({ questionId: question._id });
        } else {
            // Question is a poll
            attempts = await PollVote.find({ questionId: question._id });
        }

        let users = [];
        let userHasGuessed = false;
        // const chosenOptions = {};
        for(let i = 0; i < attempts.length; i++) {
            const user = await User.findById(attempts[i].userId, 'username displayName avatarUrl');
            users.push(user);
            console.log(user);
            if(user._id == req.userData._id) userHasGuessed = true;
        }
        if(!userHasGuessed && relativeIndex == 0) {
            console.log("User has not played")
            return res.status(400).json({
                msg: "User has not played queried question"
            })
        } 

        return !isQuiz ?
            res.status(200).json({
                qType: 'Poll',
                question: question,
                votes: attempts,
                users: users
            })
        :
        res.status(200).json({
            qType: 'Quiz',
            question: question,
            guesses: attempts,
            users: users,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            err: err
        });
    }
}