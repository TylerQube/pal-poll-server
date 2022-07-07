const Question = require("../model/Question");
const AnswerOptions = require("../model/AnswerOptions");
const Config = require("../../palpoll-config/model/Config");

exports.getDailyQuestion = async (req, res) => {
    try {
        const config = await Config.getSingletonConfig();
        const startDate = config.startDate;
        console.log(`config: ${config}`);

        const daysSinceStart = daysSince(startDate);
        if(daysSinceStart < 0) {
            throw new Error("PalPoll has not yet started.");
        }

        // questions are 0-indexed
        const qIndex = Math.floor(daysSinceStart) - 1;
        const question = await Question.findOne({ orderNum : qIndex }, { answerNumber : 0 /* Exclude answer number when sending question */});
        
        if(!question) throw new Error({error : "No daily question found"});
        res.status(200).json({
            question: dailyQuestion
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            err: err
        });
    }
};

const daysSince = (dateStr) => {
    const today = Date.now();
    const startDate = new Date(dateStr);
    console.log(dateStr);

    const timeDiff = today - dateStr.getTime();
    const numDays = timeDiff / (1000 * 3600 * 24);
    console.log(numDays)
    return numDays >= 0 ? numDays : -1;
}

exports.getQuestions = async (req, res, startIndex, num) => {
    try {
        const questions = await Question.find({
            orderNum: { $gt: startIndex-1, $lt: startIndex+num }
        }).sort({orderNum: 'ascending'});

        res.status(200).json({
            questions
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
        const existingQuestion = await Question.findOne({ questionBody: req.body.questionBody });
        if(existingQuestion != null) {
            return res.status(409).json({
                message: "question body already exists"
            });
        }

        // count existing questions
        const numQuestions = await Question.count({});
        // check if ordernum already exists
        const existingOrderNum = await Question.findOne({ orderNum: req.body.orderNum });
        if(existingOrderNum != null) {
            return res.status(500).json({
                err: "Internal error with question ordering"
            });
        }

        console.log(req.body);
        // construct array of AnswerOption documents
        const options = reqToAnswerOptions(req.body.answerOptions);

        const newQuestion = new Question({
            questionBody: req.body.questionBody,
            // order is 0 indexed
            orderNum: numQuestions,
            // use array of generated AnswerOption docs
            answerOptions: options,
            answerNumber: req.body.answerNumber
        });

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
        const question = await Question.findOne({ _id : req.body.questionId });

        if (!question) {
            return res.status(401).json({ error: "Question not found" });
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
        if(req.body.answerOptions) {
            const newOptions = reqToAnswerOptions(req.body.answerOptions);
            question.answerOptions = newOptions;
        }
        if(req.body.answerNumber) {
            question.answerNumber = req.body.answerNumber;
        }

        let data = question.save();
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
        const toRemove = await Question.findOne({ _id: questionId });
        const data = await Question.deleteOne({ _id: questionId });

        // adjust order number of all subsequent questions
        const questions = await Question.find({
            orderNum: { $gt: toRemove.orderNum }
        });

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

        const question = await Question.findOne({ _id: questionId });

        if(question.orderNum > newIndex) {
            // if moved backward

            // move questions( >= new index && < old index ) + 1
            const toMoveQs = await Question.find({ 
                orderNum: {$gt: (newIndex - 1), $lt: question.orderNum}
            });

            for(let i = 0; i < toMoveQs.length; i++) {
                let q = toMoveQs[i];
                q.orderNum += 1;
                await q.save();
            }
        } else {
            // if moved forwards

            // move questions ( <= new index && > old index ) - 1
            const toMoveQs = await Question.find({ 
                orderNum: {$gt: question.orderNum, $lt: (newIndex + 1)}
            });

            for(let i = 0; i < toMoveQs.length; i++) {
                let q = toMoveQs[i];
                q.orderNum -= 1;
                await q.save();
            }
        }
        question.orderNum = newIndex;
        const data = await question.save();
        return res.status(200).json({ data });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            err : err
        });
    }
}

const reqToAnswerOptions = (rawOptions) => {
    // construct array of AnswerOption documents
    let options = [];
    for(let i = 0; i < rawOptions.length; i++) {
        const rawAnswerOption = rawOptions[i];

        const optionDoc = {
            optionNumber: i,
            answerBody: rawAnswerOption.answerBody
        };
        options.push(optionDoc);
    }
    console.log("Converted options: " + options)
    return options;
}