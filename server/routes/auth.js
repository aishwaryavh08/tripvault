const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// REGISTER

router.post("/register", async (req, res) => {
  console.log("========== REGISTER API HIT ==========");
  console.log("BODY:", req.body);

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database unavailable. Please check your MongoDB connection.",
    });
  }

  try {
    const rawUsername = req.body.Username || req.body.username || req.body.name || "";
    const username = String(rawUsername).trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    let user = await User.findOne({
      $or: [{ email }, { username }, { Username: username }],
    });

    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    user = new User({
      Username: username,
      username,
      name: username,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.json({
      message: "Registration Successful",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database unavailable. Please check your MongoDB connection.",
    });
  }

  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const payload = {
      user: {
        id: user._id.toString(),
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
      (err, token) => {
        if (err) throw err;

        res.json({
          token,
          user: {
            id: user._id,
            name: user.name || user.Username || user.username,
            Username: user.Username || user.username || user.name,
            username: user.username || user.Username || user.name,
            email: user.email,
          },
        });
      }
    );
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// CURRENT USER
router.get("/me", auth, async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database unavailable. Please check your MongoDB connection.",
    });
  }

  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const userObj = user.toObject();
    userObj.Username = userObj.Username || userObj.username || userObj.name || "";
    userObj.username = userObj.username || userObj.Username || userObj.name || "";
    userObj.name = userObj.name || userObj.Username || userObj.username || "";

    res.json(userObj);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;