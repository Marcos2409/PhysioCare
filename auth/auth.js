const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const genToken = (user) => {
  const userData = {
    id: user._id,
    login: user.login,
    rol: user.rol,
  };

  const token = jwt.sign(userData, process.env.SECRETO, {
    expiresIn: "8h",
  });

  return token;
};

const verifyToken = (token) => {
  try {
    const result = jwt.verify(token, process.env.SECRETO);

    return {
      valid: true,
      result,
    };
  } catch (error) {
    return {
      valid: false,
      result: null,
    };
  }
};

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    const token = req.headers["authorization"]
      ? req.headers["authorization"].split(" ")[1]
      : null;

    if (!token) {
      return res.status(403).json({
        error: "Unauthorised access: token not provided.",
      });
    }

    const { valid, result } = verifyToken(token);

    if (!valid) {
      return res.status(403).json({
        error: "Unauthorised access: token is not vaild.",
      });
    }

    if (!allowedRoles.includes(result.rol)) {
      console.log(result.rol);
      return res.status(403).json({
        error: "Unauthorised access for this rol: " + result.rol,
      });
    }

    req.user = result;
    next();
  };
};

module.exports = {
  genToken,
  verifyToken,
  authorize,
};
