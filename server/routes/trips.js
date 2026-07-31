const express = require("express");
const router = express.Router();

const Trip = require("../models/Trip");
const auth = require("../middleware/authMiddleware");

// CREATE TRIP
router.post("/", auth, async (req, res) => {
  try {
    const {
      title,
      destination,
      startDate,
      endDate,
      description,
      rating,
    } = req.body;

    const trip = new Trip({
      title,
      destination,
      startDate,
      endDate,
      description,
      rating,
      user: req.user.id,
    });

    await trip.save();

    res.status(201).json(trip);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// GET MY TRIPS
router.get("/", auth, async (req, res) => {
  try {
    const trips = await Trip.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(trips);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// GET ONE TRIP
router.get("/:id", auth, async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    res.json(trip);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// UPDATE TRIP
router.put("/:id", auth, async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    res.json(trip);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// DELETE TRIP
router.delete("/:id", auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    if (trip.user.toString() !== req.user.id) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    await Trip.findByIdAndDelete(req.params.id);

    res.json({
      message: "Trip deleted successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;