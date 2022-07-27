const Config = require('../model/Config');

exports.getConfig = async (req, res) => {
    try {
        const config = await Config.getSingletonConfig();
        res.send(config);
    } catch(err) {
        console.log(err);
        res.status(500).json({
            err: err
        });
    }
};

// YYYY-MM-DD
exports.updateStartDate = async (req, res) => {
    try {
        const config = await Config.getSingletonConfig();
        config.startDate = req.body.startDate;
        const result = await config.save();
        res.status(200).send({
            data: result
        });
    } catch(err) {
        console.log(err);
        res.status(500).json({
            err: err
        });
    }
};