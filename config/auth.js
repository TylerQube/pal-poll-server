const jwt = require("jsonwebtoken");
exports.authUser = (req, res, next) => {
  try {
    const token = req.headers.authorization.replace("Bearer ", "");
    console.log(token);
    const decoded = jwt.verify(token, "secret");
    // save decoded user data to request for later use 
    req.userData = decoded;
    console.log("User authorized:\n" + req.userData);
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Authentification Failed"
    });
  }
};