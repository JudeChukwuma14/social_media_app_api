const jwt = require("jsonwebtoken");
const { logout } = require("./joiVaildation");

const verifyToken = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      const err = new Error("authorization headers is missing"); // check for missing header
      err.status = 404;
      throw err;
    }
    const { error } = logout({ authorization: req.headers.authorization }); // validate headers format
    if (error) {
      const err = new Error(error.details[0].message);
      err.status = 400;
      throw err;
    }
    const token = req.headers.authorization.split(" ")[1]; // extracted JWT form the Bearer token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET); // verify token with secret
    req.user = { userId: decoded.userId, email: decoded.email }; // i attech user data to requests
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = verifyToken;
