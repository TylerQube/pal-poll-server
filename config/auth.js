const jwt = require("jsonwebtoken");
exports.authUser = (req, res, next) => {
  try {
    const token = req.headers.authorization.replace("Bearer ", "");
    console.log("Secret: " + process.env.JWT_SECRET)
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "secret");
    // save decoded user data to request for later use 
    req.userData = decoded;
    console.log("User authorized");
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