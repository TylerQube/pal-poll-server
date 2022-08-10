const { QuizGuess, PollVote } = require('../model/UserGuess');
const User = require('../../user/model/User');
const questionController = require('../../question/controller/questionController')

exports.submitGuess = async (req, res) => {
    try {
        const userId = req.userData._id;

        const question = await questionController.todayQuestion(true);
        const qId = question._id;

        console.log("NEW GUESS SUBMITTING");
        console.log(`Question ID: ${qId}`)
        console.log(question)

        const isQuiz = question.answerOptions && question.answerOptions.length > 0;
        if(isQuiz) {
            let userOption;
            let optionIndex = -1;
            for(let i = 0; i < question.answerOptions.length; i++) {
                const option = question.answerOptions[i];
                console.log(`${req.body.guess} vs ${option.answerBody}`)
                if(option.answerBody == req.body.guess) {
                    optionIndex = i;
                    userOption = option;
                }
            }

            console.log(question)
            console.log(`Correct Index: ${question.answerNumber}, Guess: ${optionIndex}`);

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