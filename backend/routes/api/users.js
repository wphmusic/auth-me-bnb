// backend/routes/api/users.js
const express = require("express");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const { setTokenCookie } = require("../../utils/auth");
const { validateLogin, validateSignup } = require("../../utils/validation");
const { User } = require("../../db/models");

const router = express.Router();

// Get current user
router.get("/current", async (req, res) => {
  const { user } = req;

  if (user) {
    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };

    return res.json({ user: safeUser });
  } else return res.json({ user: null });
});

// Log In a User
router.post("/login", validateLogin, async (req, res, next) => {
  const { credential, password } = req.body;

  const user = await User.unscoped().findOne({
    where: {
      [Op.or]: {
        username: credential,
        email: credential,
      },
    },
  });

  if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    err.message = "Invalid credentials";
    return next(err);
  }

  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
  };

  safeUser.token = await setTokenCookie(res, safeUser);

  return res.json({ user: safeUser });
});

// Signup
router.post("", validateSignup, async (req, res, next) => {
  const { firstName, lastName, email, username, password } = req.body;

  const existingUser = await User.unscoped().findOne({
    where: {
      [Op.or]: {
        username,
        email,
      },
    },
  });

  if (existingUser) {
    const err = new Error("User already exists");
    err.status = 403;
    err.title = "User already exists";
    err.errors = [];
    if (existingUser.email === email) {
      err.errors.push("User with that email already exists");
    }
    if (existingUser.username === username) {
      err.errors.push("User with that username already exists");
    }
    return next(err);
  }

  const hashedPassword = bcrypt.hashSync(password);
  const user = await User.create({
    firstName,
    lastName,
    email,
    username,
    hashedPassword,
  });

  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
  };

  safeUser.token = await setTokenCookie(res, safeUser);

  return res.json({ user: safeUser });
});

module.exports = router;
