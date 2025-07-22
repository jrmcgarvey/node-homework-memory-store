const { storedUsers, setLoggedOnUser } = require("../util/memoryStore");
const { StatusCodes } = require("http-status-codes");
const { userSchema } = require("../validation/userSchema")
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function comparePassword(inputPassword, storedHash) {
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scrypt(inputPassword, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

const register = async (req, res) => {
  const { error, value } = userSchema.validate(req.body, {abortEarly: false});
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message } );
  }
  value.hashedPassword = await hashPassword(value.password);
  delete value.password;
  storedUsers.push(value);
  setLoggedOnUser(value);
  const valueCopy = {...value};
  delete valueCopy.hashedPassword;
  res.status(StatusCodes.CREATED).json(valueCopy);
};

const login = async (req, res) => {
  if (req.body.email && req.body.password) {
    const foundUser = storedUsers.find((user) => req.body.email == user.email);
    if (foundUser) {
      if (await comparePassword(req.body.password, foundUser.hashedPassword)) {
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
