// require("dotenv").config();
// const { PrismaClient } = require("@prisma/client");
// const { createUser } = require("../services/userService");
const httpMocks = require("node-mocks-http");
const {
  index,
  show,
  create,
  update,
  deleteTask,
} = require("../controllers/taskController");

const {
  register,
  login,
  logoff,
} = require("../controllers/userController")

// a few useful globals
let user1 = null;
let user2 = null;
let saveRes = null;
let saveData = null;
let saveTaskId = null;

const { storedUsers, setLoggedOnUser } = require("../util/memoryStore.js")

beforeAll(async () => {
  // clear database
  // const prisma = new PrismaClient();
  // await prisma.Task.deleteMany(); // delete all tasks
  // await prisma.User.deleteMany(); // delete all users
  user1 = {
    email: "bob@sample.com",
    password: "Pa$$word20",
    name: "Bob",
  };
  user2 = {
    email: "alice@sample.com",
    password: "Pa$$word20",
    name: "Alice",
  };
  storedUsers.push(user1);
  storedUsers.push(user2);
  setLoggedOnUser(user1);
});

describe("testing task creation", () => {
  // it("14. cant create a task without a user id", async () => {
  //   expect.assertions(1);
  //   const req = httpMocks.createRequest({
  //     method: "POST",
  //     body: { title: "first task" },
  //   });
  //   saveRes = httpMocks.createResponse();
  //   try {
  //     await create(req, saveRes);
  //   } catch (e) {
  //     expect(e.name).toBe("TypeError");
  //   }
  // });
  // it("15. You can't create a task with a bogus user id.", async () => {
  //   expect.assertions(1);
  //   const req = httpMocks.createRequest({
  //     method: "POST",
  //     body: { title: "first task" },
  //   });
  //   req.user = { id: 72348 };
  //   saveRes = httpMocks.createResponse();
  //   try {
  //     await create(req, saveRes);
  //   } catch (e) {
  //     expect(e.name).toBe("PrismaClientKnownRequestError")
  //   }
  // });
  it("16. If you have a valid user id, create() succeeds (res.statusCode should be 201).", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { title: "first task" },
    });
    // req.user = { id: user1.id };
    saveRes = httpMocks.createResponse();
    await create(req, saveRes);
    expect(saveRes.statusCode).toBe(201);
  });
  it("17. The object returned from the create() call has the expected title.", () => {
    saveData = saveRes._getJSONData();
    saveTaskId = saveData.id.toString();
    expect(saveData.title).toBe("first task");
  });
  it("18. The object has the right value for isCompleted.", () => {
    expect(saveData.isCompleted).toBe(false);
  });
  it("19. The object does not have any value for userId.", () => {
    expect(saveData.userId).not.toBeDefined();
  });
});

describe("getting created tasks", () => {
  // it("20. You can't get a list of tasks without a user id.", async () => {
  //   expect.assertions(1);
  //   const req = httpMocks.createRequest({
  //     method: "GET",
  //   });
  //   saveRes = httpMocks.createResponse();
  //   try {
  //     await index(req, saveRes);
  //   } catch (e) {
  //     expect(e.name).toBe("TypeError");
  //   }
  // });
  it("21. If you use user1's id, index returns a 200 statusCode.", async () => {
    const req = httpMocks.createRequest({
      method: "GET",
    });
    // req.user = { id: user1.id };
    saveRes = httpMocks.createResponse();
    await index(req, saveRes);
    expect(saveRes.statusCode).toBe(200);
  });
  it("22. The returned JSON array has length 1.", () => {
    saveData = saveRes._getJSONData();
    expect(saveData).toHaveLength(1);
  });
  it("23. The title in the first array object is as expected.", () => {
    expect(saveData[0].title).toBe("first task");
  });
  it("24. The first array object does not contain a userId.", () => {
    expect(saveData[0].userId).not.toBeDefined();
  });
  // it("25. If get the list of tasks using the userId from user2, you get a 404.", async () => {
  //   const req = httpMocks.createRequest({
  //     method: "GET",
  //   });
  //   req.user = { id: user2.id };
  //   saveRes = httpMocks.createResponse();
  //   await index(req, saveRes);
  //   expect(saveRes.statusCode).toBe(404);
  // });
  it("26. You can retrieve the first array object using the `show()` method of the controller.", async () => {
    const req = httpMocks.createRequest({
      method: "GET",
    });
    // req.user = { id: user1.id };
    req.params = { id: saveTaskId };
    saveRes = httpMocks.createResponse();
    await show(req, saveRes);
    expect(saveRes.statusCode).toBe(200);
  });
  // it("27. User2 can't retrieve this object.", async () => {
  //   const req = httpMocks.createRequest({
  //     method: "GET",
  //   });
  //   req.user = { id: user2.id };
  //   req.params = { id: saveTaskId };
  //   saveRes = httpMocks.createResponse();
  //   await show(req, saveRes);
  //   expect(saveRes.statusCode).toBe(404);
  // });
});

describe("testing the update and delete of tasks.", () => {
  it("28. User1 can set the task to isCompleted: true.", async () => {
    const req = httpMocks.createRequest({
      method: "PATCH",
    });
    // req.user = { id: user1.id };
    req.params = { id: saveTaskId };
    req.body = { isCompleted: true };
    saveRes = httpMocks.createResponse();
    await update(req, saveRes);
    expect(saveRes.statusCode).toBe(200);
  });
  // it("29. User2 can't do this.", async () => {
  //   const req = httpMocks.createRequest({
  //     method: "PATCH",
  //   });
  //   req.user = { id: user2.id };
  //   req.params = { id: saveTaskId };
  //   req.body = { isCompleted: true };
  //   saveRes = httpMocks.createResponse();
  //   await update(req, saveRes);
  //   expect(saveRes.statusCode).not.toBe(200);
  // });
  // it("30. User2 can't delete this task.", async () => {
  //   const req = httpMocks.createRequest({
  //     method: "DELETE",
  //   });
  //   req.user = { id: user2.id };
  //   req.params = { id: saveTaskId };
  //   saveRes = httpMocks.createResponse();
  //   await deleteTask(req, saveRes);
  //   expect(saveRes.statusCode).not.toBe(200);
  // });
  it("31. User1 can delete this task.", async () => {
    const req = httpMocks.createRequest({
      method: "DELETE",
    });
    // req.user = { id: user1.id };
    req.params = { id: saveTaskId };
    saveRes = httpMocks.createResponse();
    await deleteTask(req, saveRes);
    expect(saveRes.statusCode).toBe(200);
  });
  it("32. Retrieving user1's tasks now returns a 404.", async () => {
    const req = httpMocks.createRequest({
      method: "GET",
    });
    // req.user = { id: user1.id };
    saveRes = httpMocks.createResponse();
    await index(req, saveRes);
    expect(saveRes.statusCode).toBe(404);
  });
});
