// const path = require("path");
// require("dotenv").config({ path: path.join(__dirname, ".env") });

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const app = express();

// app.use(cors());
// app.use(express.json());

// mongoose
//   .connect(process.env.MONGO_URI, {
//     serverSelectionTimeoutMS: 5000,
//     connectTimeoutMS: 10000,
//     socketTimeoutMS: 45000,
//   })
//   .then(() => {
//     console.log("MongoDB Connected");
//   })
//   .catch((err) => {
//     console.error("MongoDB connection failed:", err.message);
//     console.error(
//       "Please check that your Atlas cluster allows your current IP and that your MONGO_URI is correct."
//     );
//   });

// mongoose.connection.on("error", (err) => {
//   console.error("MongoDB runtime error:", err.message);
// });

// mongoose.connection.on("disconnected", () => {
//   console.warn("MongoDB disconnected");
// });

// app.use("/api/auth", require("./routes/auth"));
// app.use("/api/trips", require("./routes/trips"));

// app.get("/", (req, res) => {
//   res.send("TripVault Backend Running");
// });

// const PORT = process.env.PORT || 5000;





// app.listen(PORT, () => {
//   console.log(`Server running on ${PORT}`);
// });

const path = require("path");
const express = require("express");
const router = express.Router();

const Trip = require("../models/Trip");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

function normalizeAssetUrl(value) {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("http://localhost")) {
    return trimmed;
  }

  if (trimmed.startsWith("http://")) {
    return `https://${trimmed.slice("http://".length)}`;
  }

  return trimmed;
}

function normalizeUploadedUrl(file) {
  if (!file) return "";

  const raw = file.path || file.url || file.secure_url || "";
  if (!raw) return "";

  const replaced = raw.replace(/\\/g, "/");
  const normalizedUrl = normalizeAssetUrl(replaced);

  if (normalizedUrl.startsWith("http://") || normalizedUrl.startsWith("https://")) {
    return normalizedUrl;
  }

  const filename = replaced.split("/uploads/").pop() || replaced.split("\\uploads\\").pop() || path.basename(replaced);
  // return `http://localhost:5000/uploads/${filename}`;
  return `https://tripvault-u534.onrender.com/uploads/${filename}`;
}

function sanitizeTripMedia(trip) {
  if (!trip) return trip;

  const safeTrip = trip && typeof trip.toObject === "function" ? trip.toObject() : { ...trip };

  if (safeTrip.photoUrl) {
    safeTrip.photoUrl = normalizeAssetUrl(safeTrip.photoUrl);
  }

  if (safeTrip.coverImage) {
    safeTrip.coverImage = normalizeAssetUrl(safeTrip.coverImage);
  }

  if (Array.isArray(safeTrip.photos)) {
    safeTrip.photos = safeTrip.photos.map(normalizeAssetUrl).filter(Boolean);
  } else if (typeof safeTrip.photos === "string" && safeTrip.photos.trim()) {
    safeTrip.photos = normalizeAssetUrl(safeTrip.photos);
  }

  return safeTrip;
}

function buildTripUpdateData(body = {}, file) {
  const updateData = {};

  if (body.title !== undefined && body.title !== "") {
    updateData.title = body.title;
  }

  if (body.destination !== undefined && body.destination !== "") {
    updateData.destination = body.destination;
  }

  if (body.description !== undefined) {
    updateData.description = body.description;
  }

  if (body.startDate !== undefined) {
    updateData.startDate = body.startDate ? new Date(body.startDate) : null;
  }

  if (body.endDate !== undefined) {
    updateData.endDate = body.endDate ? new Date(body.endDate) : null;
  }

  if (body.rating !== undefined && body.rating !== "") {
    updateData.rating = Number(body.rating);
  }

  if (file) {
    updateData.photoUrl = file.path || file.url || file.secure_url || "";
  }

  return updateData;
}

// CREATE TRIP
router.post("/", auth, upload.array("photos", 10), async (req, res) => {
  try {
    const {
      title,
      destination,
      startDate,
      endDate,
      description,
      rating,
    } = req.body;

    const photoUrls = (req.files || [])
      .map((file) => normalizeUploadedUrl(file))
      .filter(Boolean);

    if (!title || !destination) {
      return res.status(400).json({
        message: "Title and destination are required",
      });
    }

    const photoUrl = photoUrls.length > 0 ? photoUrls[0] : "";
    const coverImage = photoUrl || "";
    const photos = photoUrls.length > 1 ? photoUrls.slice(1) : [];

    const trip = new Trip({
      title,
      destination,
      startDate,
      endDate,
      description,
      rating,
      photoUrl,
      coverImage,
      photos,
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

    res.json(trips.map((trip) => sanitizeTripMedia(trip)));
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

    res.json(sanitizeTripMedia(trip));
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// UPLOAD TRIP PHOTO
// router.post(
//   "/:id/upload",
//   auth,
//   upload.single("image"),
//   async (req, res) => {
//     try {
//       const trip = await Trip.findOne({
//         _id: req.params.id,
//         user: req.user.id,
//       });

//       if (!trip) {
//         return res.status(404).json({
//           message: "Trip not found",
//         });
//       }

//       if (!req.file) {
//         return res.status(400).json({
//           message: "Please upload an image",
//         });
//       }
//       trip.image = req.file.path;

//       await trip.save();

//       res.json({
//         message: "Photo uploaded successfully",
//         trip,
//       });
//     } catch (err) {
//       console.log("UPLOAD ERROR:", err);
//       console.log("UPLOAD ERROR MESSAGE:", err.message);

//       res.status(500).json({
//         message: "Server Error",
//       });
//     }

//       const imageUrl =
//         req.file.path ||
//         req.file.url ||
//         req.file.secure_url ||
//         "";

//       // Save the uploaded image as the cover image
//       trip.coverImage = imageUrl;

//       // Add the image to the photos array
//       trip.photos.push(imageUrl);

//       await trip.save();

//       res.json({
//         message: "Photo uploaded successfully",
//         trip,
//       });
//     } catch (err) {
//       console.log("UPLOAD ERROR:", err);
//       console.log("UPLOAD ERROR MESSAGE:", err.message);

//       res.status(500).json({
//         message: "Server Error",
//       });
//     }
//   }
// );

router.post(
  "/:id/upload",
  auth,
  upload.array("photos", 10),
  async (req, res) => {
    try {
      // Find the trip belonging to the logged-in user
      const trip = await Trip.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

      if (!trip) {
        return res.status(404).json({
          message: "Trip not found",
        });
      }

      // Check if images were uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: "Please upload one or more images",
        });
      }

      const imageUrls = req.files.map((file) => normalizeUploadedUrl(file));

      // Ensure we only keep valid URLs
      const validUrls = imageUrls.filter(Boolean);

      if (validUrls.length === 0) {
        return res.status(400).json({
          message: "Uploaded files did not contain valid image URLs",
        });
      }

      // Keep the first uploaded image as the cover image if there is no cover yet
      if (!trip.photoUrl && validUrls.length > 0) {
        trip.photoUrl = validUrls[0];
      }

      if (!trip.coverImage && trip.photoUrl) {
        trip.coverImage = trip.photoUrl;
      }

      trip.photos = [...new Set([...(trip.photos || []), ...validUrls])];

      await trip.save();

      res.json({
        message: "Photos uploaded successfully",
        trip: sanitizeTripMedia(trip),
      });
    } catch (err) {
      console.log("UPLOAD ERROR:", err);
      console.log("UPLOAD ERROR MESSAGE:", err.message);

      res.status(500).json({
        message: "Server Error",
      });
    }
  }
);

// UPDATE TRIP
router.put("/:id", auth, upload.array("photos", 10), async (req, res) => {
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

    const updateData = buildTripUpdateData(req.body);

    Object.assign(trip, updateData);

    if (req.files && req.files.length > 0) {
      const newPhotoUrls = req.files
        .map((file) => normalizeUploadedUrl(file))
        .filter(Boolean);

      if (newPhotoUrls.length > 0) {
        if (!trip.photoUrl) {
          trip.photoUrl = newPhotoUrls[0];
        }

        if (!trip.coverImage && trip.photoUrl) {
          trip.coverImage = trip.photoUrl;
        }

        trip.photos = [...new Set([...(trip.photos || []), ...newPhotoUrls])];
      }
    }

    await trip.save();

    res.json(sanitizeTripMedia(trip));
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
    console.log("Trip ERROR:",err);

    res.status(500).json({
      message: err.message,
      error: err
    });
  }
});

module.exports = router;
module.exports.buildTripUpdateData = buildTripUpdateData;


// console.log(err);

//     res.status(500).json({
//       message: "Server Error",
//     });
//   }
// });

