const { storedUsers, setLoggedOnUser } = require("../util/memoryStore");
const { StatusCodes } = require("http-status-codes");
const { userSchema } = require("../validation/userSchema")

const register = (req, res) => {
  const { error, value } = userSchema.validate(req.body, {abortEarly: false});
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message } );
  }
  storedUsers.push(value);
  setLoggedOnUser(value);
  const valueCopy = {...value};
  delete valueCopy.password;
  res.status(StatusCodes.CREATED).json(valueCopy);
};

const login = (req, res) => {
  if (req.body.email && req.body.password) {
    const foundUser = storedUsers.find((user) => req.body.email == user.email);
    if (foundUser) {
      if (foundUser.password == req.body.password) {
        setLoggedOnUser(foundUser);
        return res.json({ name: foundUser.name });
      }
    }
  }
  res
    .status(StatusCodes.UNAUTHORIZED)
    .json({ message: "Authentication failed." });
};

const logoff = (req, res) => {
  setLoggedOnUser(null);
  res.sendStatus(StatusCodes.OK);
};

module.exports = { register, login, logoff };
