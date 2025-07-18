const { StatusCodes } = require("http-status-codes");
const { getLoggedOnUser } = require("../util/memoryStore");

module.exports = (req, res, next) => {
  if (!getLoggedOnUser())
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized." });
  next();
};
