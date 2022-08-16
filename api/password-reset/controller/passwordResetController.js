const User = require('../../user/model/User');
const ResetToken = require('../model/ResetToken');
const jwt = require('jsonwebtoken');
const config = require('../../../config/db')

// structure based on https://dev.to/cyberwolves/how-to-implement-password-reset-via-email-in-node-js-132m
exports.sendResetEmail = async (req, res) => {
    try {
        if(!req.body.email) return res.status(400).send("Must include email");
        const userEmail = req.body.email;

        console.log(userEmail)

        const user = await User.findOne({ email: userEmail });

        if(!user) return res.status(400).send("No user found with specified email");

        const tokens = await ResetToken.find({ userId: user._id });
        // delete all existing reset tokens
        if(tokens) {
            for(let i = 0; i < tokens.length; i++) {
                tokens[i].delete();
            }
        }

        const jwtToken = jwt.sign(
            { _id: user._id },
            config.jwt_secret ?? "secret",
            {
                expiresIn: "15m"
            }
        ); 

        const resetToken = await new ResetToken({
            userId: user._id,
            token: jwtToken
        }).save();

        const resetLink = `https://${process.env.FRONT_END_URL}/password-reset/${user._id}`;

        await sendEmail(user.email, user.displayName, resetLink);
        return res.status(200);

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            err: err
        })
    }
}

const nodemailer = require('nodemailer');

const sendEmail = async (email, displayName, url) => {
    var transporter = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
        }
    });
    
    const mailOptions = {
        to: email, // list of receivers
        subject: 'Reset your password', // Subject line
        html: `
            <img src="cid:palpoll-logo" style="max-width: 300px;"/>
            <p>Hi, ${displayName}</p>
            <p>Use the link below to reset your password</p>
            <a href="${url}">Reset Password</a>
            <br/>
            <br/>
            <p>If you didn't request this password reset, figure out who the hell did.</p>
        `, // plain text body,
        attachments: [{
            filename: 'palpoll_logo.png',
            path: 'public/palpoll_logo.png',
            cid: 'palpoll-logo'
        }]
    };
    
    await transporter.sendMail(mailOptions)
};