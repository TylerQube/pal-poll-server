const User = require("../model/User");
const cloudinary = require('cloudinary');
const axios = require('axios');

exports.registerNewUser = async (req, res) => {
    try {
      const existingUser = await User.findOne({ username: req.body.username });

      console.log(existingUser);
      if (existingUser != null) {
        return res.status(409).json({
          message: "name already in use"
        });
      }

      const avatarUrl = await axios.get(`https://ui-avatars.com/api/?size=144&name=${req.body.displayName[0].toUpperCase()}&background=random`)

      const filename = `${req.body.username}_avatar`;

      let cloudinaryUrl;
      await cloudinary.v2.uploader.upload(avatarUrl,
      { public_id: filename, gravity: "auto", height: 144, width: 144, crop: "fill" }, (err, res) => {
        console.log(res); 
        cloudinaryUrl = res.secure_url
      });

      // save with blank email by default
      const user = new User({
        username: req.body.username,
        displayName: req.body.displayName,
        email: "",
        password: req.body.password,
        avatarUrl: cloudinaryUrl
      });
      let data = await user.save();
      const token = await user.generateAuthToken(); // here it is calling the method that we created in the model
      res.status(201).json({ data, token });
    } catch (err) {
      console.log(err)
      res.status(400).json({ err: err });
    }
  };

exports.loginUser = async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const user = await User.findByCredentials(username, password);
    if (!user) {
      return res.status(401).json({ error: "Login failed! Check authentication credentials" });
    }
    const token = await user.generateAuthToken();
    res.status(201).json({ user, token });
  } catch (err) {
    console.log("login failed")
    res.status(400).json({ err: err });
  }
};

exports.getUserDetails = async (req, res) => {
  await res.json(req.userData);
};

// can update email and display name
exports.updateUserDetails = async (req, res) => {
  try {
    const userId = req.userData._id;
    console.log("User updating info: " + req.userData);
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(401).json({ error: "Invalid authentication! Check login status" });
    }
     
    if(req.body.email) {
      user.email = req.body.email;
    }
    if(req.body.displayName) {
      user.displayName = req.body.displayName;
    }

    user.save();
    const token = await user.generateAuthToken();
    return res.status(200).json({ token });

  } catch (err) {
    console.log("update failed")
    res.status(400).json({ err: err });
  }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    console.log(req.file);
    const filename = `${req.userData.name}_avatar`;
    console.log(filename)

    const img_uri = await getDataUri(req);
    let secureUrl;
    const avatar_size = 144;

    await cloudinary.v2.uploader.upload(img_uri.content,
    { public_id: filename, gravity: "auto", height: avatar_size, width: avatar_size, crop: "fill" }, (err, res) => {
      console.log(res); 
      secureUrl = res.secure_url;
    });
    await User.updateAvatar(req.userData.name, secureUrl);

    // resize and crop avatar
    await cloudinary.image(img_uri.content, {})
    
    res.status(200).json({ msg: "Avatar updated."});
  } catch (err) {
    console.log("update failed")
    console.log(err)
    res.status(400).json({ err: err });
  }
};

const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();
const path = require('path')

const getDataUri = async req => {
  return parser.format(path.extname(req.file.originalname).toString(), req.file.buffer);
};

exports.getUserAvatar = async (req, res) => {
  try {
    console.log(req.query.username)
    const user = await User.findOne({ username: req.query.username });
    if(!user) throw new Error("User not found")
    console.log(user);
    const url = user.avatarUrl;
    if(!url) throw new Error("No avatar found");
    console.log(url);
    res.status(200).send(url);
  } catch (err) {
    console.log(err)
    res.status(400).json({ err: err }); 
  }
};