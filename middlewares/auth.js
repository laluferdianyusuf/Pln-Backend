const jwt = require("jsonwebtoken");
const { JWT, ROLES } = require("../lib/const");
const UserRepository = require("../repositories/userRepository");

const authenticate = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  let token = "";

  if (authHeader && authHeader.startsWith("Bearer"))
    token = authHeader.split(" ")[1];
  else
    return res.status(401).send({
      status_info: false,
      message: "You have to login first",
      data: null,
    });

  try {
    const { email } = jwt.verify(token, JWT.SECRET);

    const getUsers = await UserRepository.getByEmail({ email });
    req.users = getUsers;

    next();
  } catch (err) {
    return res.status(401).send({
      status_info: false,
      message: "yPlease login again",
      data: null,
    });
  }
};

const isSuperAdmin = async (req, res, next) => {
  const user = req.users;

  if (user && user.role === ROLES.SUPERVISOR) {
    return next();
  }
  return res.status(401).json({
    status_info: false,
    message: "You don't have permission to access this feature",
    data: null,
  });
};

module.exports = { authenticate, isSuperAdmin };
