const { sum } = require("../services");

const sumRequest = (req, res) => {
  const { a, b } = req.body;
  const result = sum(parseInt(a), parseInt(b));
  res.json({ result });
};

module.exports = { sumRequest };
