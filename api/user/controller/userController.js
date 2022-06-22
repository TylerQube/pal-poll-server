const User = require("../model/User");

exports.registerNewUser = async (req, res) => {
    try {
      // const isAdmin = req.userData.role === "admin";
      // if(!isAdmin) {
      //   return res.status(401).json({
      //     message: "unauthorized to register new user"
      //   });
      // }
      const existingUser = await User.findOne({ username: req.body.username });

     console.log(existingUser);
      if (existingUser != null) {
        return res.status(409).json({
          message: "name already in use"
        });
      }

      // save with blank email by default
      const user = new User({
        username: req.body.username,
        displayName: req.body.displayName,
        email: "",
        password: req.body.password
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