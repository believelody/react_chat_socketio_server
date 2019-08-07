const express = require("express"),
  bcrypt = require("bcryptjs"),
  jwt = require("jsonwebtoken");
const User = require("../models/user");
const httpUtils = require("../utils/httpUtils");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.findAll();

    return httpUtils.fetchDataSuccess(res, users);
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return httpUtils.notFound(res, { msg: "User not found" });
    else return httpUtils.fetchDataSuccess(res, user);
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.post("/login", async (req, res) => {
  try {
    let errors = {};
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      errors.email = `Invalid email`;
      return httpUtils.errorHandled(res, errors);
    } else {
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        errors.password = `Incorrect password`;
        return httpUtils.errorHandled(res, errors);
      } else {
        const payload = { userId: user.id, name: user.name };
        const token = await jwt.sign(payload, process.env.SECRET, {
          algorithm: process.env.JWT_ALGO,
          expiresIn: "7d"
        });
        return httpUtils.fetchDataSuccess(res, { success: true, token });
      }
    }
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.post("/register", async (req, res) => {
  try {
    let errors = {};
    const { name, email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user) {
      errors.email = "This email already exists";
      return httpUtils.errorHandled(res, errors);
    } else {
      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(password, salt);
      const newUser = {
        name,
        email,
        password: hash,
        role: email === process.env.ADMIN_EMAIL ? "admin" : "public"
      };
      await User.create(newUser);
      return httpUtils.fetchDataSuccess(res, {
        msg: "User successfully created"
      });
    }
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const user = await User.findBypk(req.params.id);
    if (!user) {
      return httpUtils.notFound(res, "User not found");
    } else {
      await user.update(req.body.data);
      return httpUtils.fetchDataSuccess(res, {
        msg: "Information successfully updated"
      });
    }
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findBypk(req.params.id);
    if (!user) {
      return httpUtils.notFound(res, { msg: "User not found" });
    } else {
      await user.destroy();
      return httpUtils.fetchDataSuccess(res, {
        msg: "Your account has been deleted"
      });
    }
  } catch (error) {
    return httpUtils.internalError(res);
  }
});

module.exports = router;
