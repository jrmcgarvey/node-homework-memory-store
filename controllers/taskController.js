const { getLoggedOnUser } = require("../util/memoryStore");
const { StatusCodes } = require("http-status-codes");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema")

const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber += 1;
    return lastTaskNumber;
  };
})();

const index = (req, res) => {
  const loggedOnUser = getLoggedOnUser();
  if (loggedOnUser.tasklist && loggedOnUser.tasklist.length) {
    return res.json(loggedOnUser.tasklist);
  }
  res.sendStatus(StatusCodes.NOT_FOUND);
};

const show = (req, res) => {
  const loggedOnUser = getLoggedOnUser();
  const taskToFind = parseInt(req.params.id);
  if (taskToFind && loggedOnUser.tasklist) {
    const foundTask = loggedOnUser.tasklist.find(
      (task) => task.id === taskToFind,
    );
    if (foundTask) {
      return res.json(foundTask);
    }
  }
  res
    .status(StatusCodes.NOT_FOUND)
    .json({ message: "That task was not found." });
};

const deleteTask = (req, res) => {
  const loggedOnUser = getLoggedOnUser();
  const taskToFind = parseInt(req.params.id);
  if (taskToFind && loggedOnUser.tasklist) {
    const taskIndex = loggedOnUser.tasklist.findIndex(
      (task) => task.id === taskToFind,
    );
    if (taskIndex != -1) {
      const task = loggedOnUser.tasklist[taskIndex];
      loggedOnUser.tasklist.splice(taskIndex, 1);
      return res.json(task);
    }
  }
  res
    .status(StatusCodes.NOT_FOUND)
    .json({ message: "That task was not found." });
};

const create = (req, res) => {
  const { error, value } = taskSchema.validate(req.body, {abortEarly: false});
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message } );
  }
  const loggedOnUser = getLoggedOnUser();
  if (!loggedOnUser.tasklist) {
    loggedOnUser.tasklist = [];
  }
  const newTask = { ...value };
  newTask.id = taskCounter();
  loggedOnUser.tasklist.push(newTask);
  return res.status(StatusCodes.CREATED).json(newTask);
};

const update = (req, res) => {
  let message = null;
  let newValue;
  if (!Object.keys(req.body).length) { // if the object is empty
    message = "No attributes were specified to be updated.";
  } else {
    const { error, value } = patchTaskSchema.validate(req.body, {abortEarly: false});
    if (error) {
      message = error.message;
    }
    newValue = value;
  }
  if (message) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message } );
  }
  const loggedOnUser = getLoggedOnUser();
  const taskToFind = parseInt(req.params.id);
  if (taskToFind && loggedOnUser.tasklist) {
    const task = loggedOnUser.tasklist.find((task) => task.id === taskToFind);
    if (task) {
      Object.assign(task, newValue);
      return res.json(task);
    }
  }
  res
    .status(StatusCodes.NOT_FOUND)
    .json({ message: "That task was not found." });
};

module.exports = { update, create, deleteTask, index, show };
