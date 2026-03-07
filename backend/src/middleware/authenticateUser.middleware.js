const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const authenticateUser = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    // Fallback: check Authorization header
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized!" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong!" });
  }
};

module.exports =  authenticateUser ;