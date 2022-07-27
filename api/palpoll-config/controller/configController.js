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