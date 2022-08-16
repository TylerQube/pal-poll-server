const mongoose = require("mongoose");

const resetTokenSchema = mongoose.Schema({
    userId: {
        type: String,
        required: [true, "Include a userId"]
    },
    token: {
        type: String,
        required: [true, "Include a token"]
    },
});

const ResetToken = mongoose.model("ResetToken", resetTokenSchema);
module.exports = ResetToken;