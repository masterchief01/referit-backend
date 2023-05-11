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
