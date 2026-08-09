const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Trip = require("../models/Trip");
const auth = require("../middleware/authMiddleware");

// PUBLIC PROFILE
router.get("/:username/profile", async (req, res) => {
  try {
    const user = await User.findOne({
      $or: [{ username: req.params.username }, { Username: req.params.username }],
    }).select("username Username bio");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const trips = await Trip.find({
      user: user._id,
    }).select("title destination startDate endDate rating coverImage");

    res.json({
      userId: user._id,
      username: user.username || user.Username,
      bio: user.bio || "",
      trips,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// UPDATE PROFILE
router.put("/profile", auth, async (req, res) => {
  try {
    const { Username, bio } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const trimmedUsername = typeof Username === "string" ? Username.trim() : "";
    const safeBio = typeof bio === "string" ? bio : "";

    if (trimmedUsername) {
      const existingUser = await User.findOne({
        Username: trimmedUsername,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          message: "This username is already taken.",
        });
      }

      user.Username = trimmedUsername;
    }

    user.bio = safeBio;
    await user.save();

    res.json({
      message: "Profile updated",
      bio: user.bio,
      username: user.Username,
    });
  } catch (err) {
    console.log(err);

    if (err && err.code === 11000) {
      return res.status(400).json({
        message: "This username is already taken.",
      });
    }

    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;