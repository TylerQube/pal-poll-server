const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../../config/db")

const userSchema = mongoose.Schema({
    username: {
      type: String,
      required: [true, "Please Include your username"]
    },
    displayName: {
      type: String,
      required: [true, "Please specify a display name"]
    },
    email: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: [true, "Please Include your password"]
    },
    avatarUrl: {
      type: String,
      required: [true, "Please include an avatar URL"]
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"]
    },
  }, { collection: 'users' });

  //this method will hash the password before saving the user model
userSchema.pre("save", async function(next) {
  const user = this; 
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, parseInt(process.env.SALT));
  }
  next();
});

//this method generates an auth token for the user
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  // store relevant user data in jwt
  const token = jwt.sign(
    { _id: user._id, name: user.username, email: user.email, displayName: user.displayName, role: user.role },
    config.jwt_secret ?? "secret",
    {
      expiresIn: "30d"
    }
  );
  // user.tokens = user.tokens.concat({ token });
  // await user.save();
  return token;
};

//this method search for a user by email and password.
userSchema.statics.findByCredentials = async (username, password) => {
  const user = await User.findOne({ username: username });
  if (!user) {
    // throw new Error({ error: "Invalid login details" });
    return null;
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    // throw new Error({ error: "Invalid login details" });
    return null;
  }
  return user;
};

userSchema.statics.updateAvatar = async (username, newUrl) => {
  const user = await User.findOne({ username: username });
  if (!user) {
    throw new Error({ error: "Invalid login details" });
  }
  user.avatarUrl = newUrl;
  user.save();
};

const User = mongoose.model("User", userSchema);
module.exports = User;