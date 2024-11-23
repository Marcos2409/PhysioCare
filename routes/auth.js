const express = require("express");
let User = require("../models/user.js");
let router = express.Router();
const { genToken } = require("../auth/auth.js");
const bcrypt = require("bcrypt");

//User login
router.post("/login", async (req, res) => {
  let login = req.body.login;
  let password = req.body.password;

  try {
    const user = await User.findOne({ login });
    console.log(user);

    if (!user || !password) {
      return res.status(401).json({
        error: "Wrong login: lack of parameters",
        result: null,
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        error: "Wrong login: incorrect password",
        result: null,
      });
    }

    const token = genToken(user);

    return res.status(200).json({
      result: token,
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error" + error,
      result: null,
    });
  }
});

module.exports = router;
