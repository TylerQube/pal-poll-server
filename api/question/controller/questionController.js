const Question = require("../model/Question");
const AnswerOptions = require("../model/AnswerOptions");
const Config = require("../../palpoll-config/model/Config");
const PollQuestion = require("../model/PollQuestion");
const { QuizGuess, PollVote } = require("../../guess/model/UserGuess");

exports.getDailyQuestion = async (req, res) => {
    try {
        const question = await this.todayQuestion();
        
        if(!question) throw new Error({error : "No daily question found"});

        // const existingGuess = await QuizGuess.findOne({ userId: req.userData._id, questionId: question._id }) ?? await PollVote.findOne({ userId: req.userData._id, questionId: question._id });
        // console.log("Existing: ");
        // console.log(existingGuess)
        // if(existingGuess != null) {
        //     return res.status(400).json({
        //         msg: "User has already played today"
        //     })
        // }
        res.status(200).json({
            question: question
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            err: err
        });
    }
};

exports.todayQuestion = async (withAnswer = false) => {
    const config = await Config.getSingletonConfig();
    const startDate = config.startDate;
    console.log(`config: ${config}`);

    const daysSinceStart = exports.daysSince(startDate);
    if(daysSinceStart < 0) {
        return res.status(400).json({
            msg: "PalPoll has not yet started."
        })
    }

    // questions are 0-indexed
    const qIndex = Math.floor(daysSinceStart);
    return question = await Question.findOne({ orderNum : qIndex }, withAnswer ? {} : { answerNumber: 0 /* Exclude answer number when sending question */});
}

exports.getQuestionType = async (req, res) => {
    // return res.status(200).json({
    //     orderNum: 2,
    //     qType: 'Poll'
    // });
    try {
        

        const config = await Config.getSingletonConfig();
        const startDate = config.startDate;
        console.log(`config: ${config}`);

        const daysSinceStart = exports.daysSince(startDate);
        if(daysSinceStart < 0) {
            return res.status(400).json({
                msg: "PalPoll has not yet started."
            })
        }

        // questions are 0-indexed
        const qIndex = Math.floor(daysSinceStart);
        const question = await Question.findOne({ orderNum : qIndex }, { answerNumber : 0 /* Exclude answer number when sending question */});
        
        if(!question) throw new Error({error : "No daily question found"});
        console.log("options: " + typeof(question.answerOptions))

        // const existingGuess = await QuizGuess.findOne({ userId: req.userData._id, questionId: question._id }) ?? await PollVote.findOne({ userId: req.userData._id, questionId: question._id });
        // console.log("Existing: ");
        // console.log(existingGuess)
        // if(existingGuess != null) {
        //     return res.status(400).json({
        //         msg: "User has already played today"
        //     })
        // }

        const qType = question.answerOptions != undefined && question.answerOptions != null && question.answerOptions.length > 0 ? 'Quiz' : 'Poll';
        return res.status(200).json({
            orderNum: question.orderNum,
            qType: qType
        });
    } catch(err) {
        console.log(err);
        res.status(500).json({
            err: err
        });
    }
}

exports.daysSince = (dateStr) => {
    const today = new Date();
    const startDate = new Date(dateStr.toString().slice(0, 10));

    const timeDiff = today - dateStr.getTime();
    const numDays = timeDiff / (1000 * 3600 * 24);
    return numDays >= 0 ? numDays : -1;
}

exports.getQuestions = async (req, res, startIndex, num) => {
    try {
        const questions = await Question.find({
            orderNum: { $gt: startIndex-1, $lt: startIndex+num }
        }).sort({orderNum: 'ascending'});

        const config = await Config.getSingletonConfig();
        const startDate = config.startDate;
        console.log(`config: ${config}`);

        const daysSinceStart = Math.floor(exports.daysSince(startDate));

        let qArchive = [];
        for(const i in questions) {
            console.log("Order" + questions[i].orderNum);
            console.log("Days: " + daysSinceStart)
            const archived = questions[i].orderNum <= daysSinceStart;
            qArchive.push({
                question: questions[i],
                archived: archived
            })
        }

        res.status(200).json({
            questionList: qArchive,
            daysSince: daysSinceStart
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            err: err
        });
    }
}

exports.addQuestion = async (req, res) => {
    try {
        // check if question with body exists
        const existingQuestion = await Question.findOne({ questionBody: req.body.questionBody }) ?? await PollQuestion.findOne({ questionBody: req.body.questionBody });
        if(existingQuestion != null) {
            return res.status(409).json({
                message: "question body already exists"
            });
        }

        // count existing questions
        const numQuestions = await Question.count({});
        // check if ordernum already exists
        const existingOrderNum = await Question.findOne({ orderNum: req.body.orderNum }) ?? await PollQuestion.findOne({ orderNum: req.body.orderNum });
        if(existingOrderNum != null) {
            return res.status(500).json({
                err: "Internal error with question ordering"
            });
        }

        console.log(req.body);
        // construct array of AnswerOption documents
        const options = reqToAnswerOptions(req.body.answerOptions, req.body.answerNumber);
        let newQuestion;

        const qType = req.body.questionType;

        if(qType == "Poll") {
            newQuestion = new PollQuestion({
                questionBody: req.body.questionBody,
                // order is 0 indexed
                orderNum: numQuestions,
            });
        }
        else {
            newQuestion = new Question({
                questionBody: req.body.questionBody,
                // order is 0 indexed
                orderNum: numQuestions,
                // use array of generated AnswerOption docs
                answerOptions: options,
                answerNumber: req.body.answerNumber
            });
        }

        let data = await newQuestion.save();
        return res.status(201).json({ data });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            err: err
        });
    }
};

exports.editQuestion = async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.body.questionId)
        const question = await Question.findOne({ _id : req.body.questionId, "answerOptions.0": { "$exists": true } }) ?? await PollQuestion.findOne({ _id : req.body.questionId });
        console.log(question)

        if (!question) {
            return res.status(401).json({ error: "Question not found" });
        }

        // switch from Quiz to Poll
        if(req.body.questionType == "Quiz" && (!question.answerOptions || question.answerOptions.length == 0)) {
            const newQuiz = new Question({
                questionBody: req.body.questionBody,
                // order is 0 indexed
                orderNum: question.orderNum,
                // use array of generated AnswerOption docs
                answerOptions: req.body.answerOptions,
                answerNumber: req.body.answerNumber
            });
            await PollQuestion.deleteOne({ _id: req.body.questionId });
            const data = await newQuiz.save();
            return res.status(200).json({ data });
        }
        else if(req.body.questionType == "Poll" && question.answerOptions && question.answerOptions.length > 0) {
            const newPoll = new PollQuestion({
                questionBody: req.body.questionBody,
                // order is 0 indexed
                orderNum: question.orderNum,
            });
            await Question.deleteOne({ _id: req.body.questionId });
            const data = await newPoll.save();
            return res.status(200).json({ data });
        }

        if(req.body.questionBody) {
            question.questionBody = req.body.questionBody;
        }
        if(req.body.orderNum) {
            const numQuestions = await Question.count({}, (err, count) => {
                return count;
            })
            if(req.body.orderNum < 0 || req.body.orderNum >= numQuestions) return res.status(400).json({ err : "Invalid question order number" })
            question.orderNum = req.body.orderNum;
        }
        if(req.body.questionType == "Quiz" && req.body.answerOptions) {
            const newOptions = reqToAnswerOptions(req.body.answerOptions);
            question.answerOptions = newOptions;
        }
        if(req.body.questionType == "Quiz" && req.body.answerNumber) {
            question.answerNumber = req.body.answerNumber;
        }

        let data = await question.save();
        return res.status(200).json({ data });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            err : err
        });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const questionId = req.body.questionId;
        // delete question
        let toRemove = await Question.findOne({ _id: questionId });
        const data = await Question.deleteOne({ _id: questionId });

        // let question = await Question.findOne({ _id: questionId });
        // if(toRemove == null || question.answerOptions.length == 0) question = await PollQuestion.findOne({ _id: questionId })

        // adjust order number of all subsequent questions
        const questions = await Question.find({
            orderNum: { $gt: toRemove.orderNum },
            "answerOptions.0" : { $exists: true } 
        });

        const toMovePolls = await PollQuestion.find({ orderNum: { $gt: toRemove.orderNum } });

        questions.push(...toMovePolls);
        console.log("QUestions: ")
        console.log(questions)

        for(let i = 0; i < questions.length; i++) {
            const q = questions[i];
            q.orderNum = q.orderNum - 1;
            await q.save();
            console.log(`Increasing q at index ${q.orderNum}`);
        }

        return res.status(200).json({ data });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            err : err
        });
    }
}

exports.changeOrder = async (req, res) => {
    try {
        console.log(req.body)
        const questionId = req.body.questionId;
        const newIndex = req.body.newOrderNum;

        let question = await Question.findOne({ _id: questionId });
        if(question == null || question.answerOptions.length == 0) question = await PollQuestion.findOne({ _id: questionId })

        let toMoveQs;
        let queryConditions = {
            "answerOptions.0" : { $exists: true } 
        }
        if(question.orderNum > newIndex) {
            // if moved backward
            // move questions( >= new index && < old index ) + 1
            queryConditions.orderNum = {$gt: (newIndex - 1), $lt: question.orderNum}
        } else {
            // if moved forwards
            // move questions ( <= new index && > old index ) - 1
            queryConditions.orderNum = {$gt: question.orderNum, $lt: (newIndex + 1)}
        }
        toMoveQs = await Question.find(queryConditions);
        const toMovePolls = await PollQuestion.find({ orderNum: queryConditions.orderNum });

        toMoveQs.push(...toMovePolls);

        for(let i = 0; i < toMoveQs.length; i++) {
            let q = toMoveQs[i];
            q.orderNum += question.orderNum > newIndex ? 1 : -1;
            // console.log(q.orderNum + " answerOptions: " + q.answerOptions.length)
            // if(q.answerOptions.length == 0) {
            //     q = new PollQuestion({
            //         questionBody: q.questionBody,
            //         orderNum: q.orderNum
            //     });
            //     console.log("Removing " + q.orderNum)
            //     await Question.deleteOne({  _id: q._id });
            // }
            await q.save();
        }

        question.orderNum = newIndex;
        console.log("NOW SAVE THE MOVED ONE")

        // if(question.answerOptions.length == 0) {
        //     console.log("Reformatting as poll")
        //     question = new PollQuestion({
        //         questionBody: question.questionBody,
        //         orderNum: newIndex
        //     });
        //     await Question.deleteOne({  _id: questionId });
        // }
        const data = await question.save();
        return res.status(200).json({ data });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            err : err
        });
    }
}

const reqToAnswerOptions = (rawOptions, answerNum) => {
    // construct array of AnswerOption documents
    let options = [];
    for(let i = 0; i < rawOptions.length; i++) {
        const rawAnswerOption = rawOptions[i];

        const optionDoc = {
            optionNumber: i,
            answerBody: rawAnswerOption.answerBody,
            isCorrect: i == answerNum
        };
        options.push(optionDoc);
    }
    console.log("Converted options: " + options)
    return options;
}