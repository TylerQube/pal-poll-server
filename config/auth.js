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
    console.log(err)
    return res.status(401).json({
      message: "Authentification Failed"
    });
  }
};

exports.adminAuth = (req, res, next) => {
  try {
    console.log(`User role: ${req.userData.role}`)
    if(req.userData.role != this.roles.admin) {
      return res.status(401).json({
        message: "Insufficient Permissions"
      });
    }
    console.log("Admin permission validated.");
    next();
  } catch (err) {
    console.log(err)
    return res.status(401).json({
      message: "Authentification Failed"
    });
  }
};

exports.roles = {
  admin: "admin",
  user: "user"
}