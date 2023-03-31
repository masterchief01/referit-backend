const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const {
  postAddUser,
  getOwnUser,
  getUserData,
  editUserData,
  getUserSecData
} = require("../controllers/users");
const isAuth = require("../middleware/is-auth");

router.get('/',(req,res) => {
    res.send(
        "welcome to users"
    )
});

router.post("/addUser", isAuth, check("name", "name is required").isLength({ min: 2 }), postAddUser);
router.get('/getUser', isAuth, getOwnUser);
router.get("/getUser/:userId", getUserData);
router.get("/getUserSec/:userId", getUserSecData);

router.patch("/editUser", isAuth, check("name", "name is required").isLength({ min: 2 }), editUserData);

module.exports = router;
