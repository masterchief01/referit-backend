const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const {
  postAddUser,
  getOwnUser,
  getUserData,
  editUserData,
  getUserSecData,
} = require("../controllers/users");
const isAuth = require("../middleware/is-auth");

router.get("/", (req, res) => {
  res.send("welcome to users");
});

/**
 * @swagger
 * /api/users/addUser:
 *   post:
 *     summary: Add a valid User.
 *     description: Add a user to the database.
 *     parameters:
 *       - in: body
 *         name: name
 *         required: true
 *     responses:
 *       201:
 *         description: user added success.
 *       400:
 *         description: Validation error.
 *       403:
 *         description: User already registered as other type.
 */
router.post(
  "/addUser",
  isAuth,
  check("name", "name is required").isLength({ min: 2 }),
  postAddUser
);

/**
 * @swagger
 * /api/users/getUser:
 *   get:
 *     summary: Get your own details.
 *     description: Get your own details.
 *     parameters:
 *     responses:
 *       200:
 *         description: user present, sanity check.
 *       404:
 *         description: user not found in DB, possible CSRF.
 */
router.get("/getUser", isAuth, getOwnUser);

/**
 * @swagger
 * /api/users/getUser/:userId:
 *   get:
 *     summary: Get User Details.
 *     description: Get User Details.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     responses:
 *       200:
 *         description: user found.
 *       404:
 *         description: user not found.
 */
router.get("/getUser/:userId", getUserData);

/**
 * @swagger
 * /api/users/getUserSec/:userId:
 *   get:
 *     summary: Get User Secondary Details.
 *     description: Get User Secondary Details.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     responses:
 *       200:
 *         description: user found.
 *       404:
 *         description: user not found.
 */
router.get("/getUserSec/:userId", getUserSecData);

/**
 * @swagger
 * /api/users/editUser:
 *   patch:
 *     summary: Update User Details.
 *     description: Update User Details.
 *     parameters:
 *       - in: body
 *         name: name
 *         required: true
 *     responses:
 *       201:
 *         description: user found and details patched.
 *       404:
 *         description: user not found.
 *       400:
 *         description: error in patching.
 */
router.patch(
  "/editUser",
  isAuth,
  check("name", "name is required").isLength({ min: 2 }),
  editUserData
);

module.exports = router;
