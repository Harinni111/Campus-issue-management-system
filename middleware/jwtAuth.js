const jwt = require("jsonwebtoken");

module.exports = function jwtAuth(req, res, next) {
  try {
    //  Read token from cookie
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    //  Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //  Attach user info to request
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      department: decoded.department
    };

    // Allow request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
