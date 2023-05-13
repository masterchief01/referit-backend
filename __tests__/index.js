
// require("dotenv").config();
// const mongoose = require("mongoose");
// const {postAddUser, getOwnUser, getUserData, getUserSecData, editUserData} = require("../controllers/users");

// let uri = process.env.MONGO_TEST_URI;
// mongoose.connect(uri);
// const connection = mongoose.connection;
// connection.once("open", () => {
//   console.log("MongoDB Test database connection established successfully");
// });

// describe("User Tests", () => {

//   it("Add User (Student) /postAddUser", async () => {
//     const req = {
//       user: {
//         "user_id": "test-student-user-id",
//         "pic": "random"
//       },
//       body: {
//         "name": "Test Student",
//         "email": "test-student-email@gmail.com",
//         "isReferee": true
//       },
//     };

//     const res = {
//       statusCode: 0,
//       body: {},
//       send: function (input) {
//         this.body = input;
//       },
//       status: function (code) {
//         this.statusCode = code;
//         return this;
//       },
//     };

//     await postAddUser(req, res);
//     expect(res.statusCode).toBe(201);
//     expect(res.body).toEqual({
//       message: "User Added Successfully",
//       isReferee: true,
//       signin: false,
//     });
//   },1000000);
// });


const { sumRequest } = require("../controllers/sample");
const { sum } = require("../services");

describe("Test the sum function and handlers", () => {
  test("check the service for /test", () => {
    expect(sum(1, 2)).toBe(3);
  });

  test("check the handler for /test", () => {
    const req = {
      body: {
        a: 1,
        b: 2,
      },
    };

    const res = {
      text: "",
      json: function (input) {
        this.text = input;
      },
    };

    sumRequest(req, res);
    expect(res.text).toEqual({ result: 3 });
  });
});
