const { QuizGuess, PollVote, QuizFail } = require('../model/UserGuess');
const User = require('../../user/model/User');
const questionController = require('../../question/controller/questionController')

exports.submitGuess = async (req, res) => {
    try {
        const userId = req.userData._id;

        const question = await questionController.todayQuestion(true);
        const qId = question._id;

        const existingGuess = await QuizGuess.findOne({ userId: req.userData._id, questionId: qId }) ?? await PollVote.findOne({ userId: req.userData._id, questionId: qId });
        console.log("Existing: ");
        console.log(existingGuess)
        if(existingGuess != null) {
            return res.status(400).json({
                msg: "User has already played today"
            })
        }

        console.log("NEW GUESS SUBMITTING");

        const isQuiz = question.answerOptions && question.answerOptions.length > 0;
        if(isQuiz) {
            console.log("It is a quiz")
            console.log(req.body)
            if(req.body.failed) {
                const quizFail = new QuizFail({
                    userId: userId,
                    questionId: qId,
                    isCorrect: false,
                    timeElapsed: req.body.guessTime
                });
    
                const data = await quizFail.save();
                return res.status(200).json({ data : data, correctIndex : question.answerNumber });
            }

            let userOption;
            let optionIndex = -1;
            for(let i = 0; i < question.answerOptions.length; i++) {
                const option = question.answerOptions[i];
                if(option.answerBody == req.body.guess) {
                    optionIndex = i;
                    userOption = option;
                }
            }

            // console.log(question)
            // console.log(`Correct Index: ${question.answerNumber}, Guess: ${optionIndex}`);

            if(!userOption || optionIndex == -1) throw new Error('No corresponding answer option found.');

            const quizGuess = new QuizGuess({
                userId: userId,
                questionId: qId,
                answerOptionId: userOption._id,
                isCorrect: userOption.isCorrect || question.answerNumber == optionIndex,
                timeElapsed: req.body.guessTime
            });

            const data = await quizGuess.save();
            return res.status(200).json({ data : data, correctIndex : question.answerNumber });
        } else {
            const pollVote = new PollVote({
                userId: userId,
                questionId: qId,
                guessContent: req.body.guess,
                timeElapsed: req.body.guessTime
            });

            const data = await pollVote.save();
            return res.status(200).json({ data : data });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            err: err
        });
    }
}