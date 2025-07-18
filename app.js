const express = require("express");
const app = express();
app.use(express.json({ limit: "1kb" }));
const userRouter = require("./routes/user");
app.use("/user", userRouter);
const taskRouter = require("./routes/task");
const authMiddleware = require("./middleware/auth");
app.use("/tasks", authMiddleware, taskRouter);

app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

const notFound = require("./middleware/not-found");
app.use(notFound);
const errorHandler = require("./middleware/error-handler");
app.use(errorHandler);

const port = process.env.PORT || 3000;
let server;
try {
  server = app.listen(port, () => console.log(`Server is listening on port ${port}...`));
} catch (error) {
  console.log(error);
}

module.exports = { app, server }
