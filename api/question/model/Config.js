const mongoose = require("mongoose");

const tomorrow = `${(new Date).getFullYear()}-${(new Date).getMonth() + 1}-${(new Date).getDate() + 1}`

const configSchema = mongoose.Schema({
    startDate: {
        type: Date,
        default: tomorrow
    },
});

configSchema.pre("save", async (next) => {

});

// Application has global config editable by administrators
// Config stored as singleton document in MongoDB

// singleton pattern sourced from: https://stackoverflow.com/questions/38965225/mongoose-singleton-model
configSchema.statics.getSingletonConfig = async () => {
    try {
        // return existing config or create and return new config
        const config = await Config.findOne().limit(1);
        if(config) { return config; }
        else { 
            const newConfig = new Config({

            });
            let data = await newConfig.save();
            return data;
        }
    } catch (err) {
        console.log(err);
    }
};

const Config = mongoose.model("Config", configSchema);
module.exports = Config;