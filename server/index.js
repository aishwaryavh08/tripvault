const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

const app = express();
const uploadsDir = path.join(__dirname, "uploads");

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

async function seedDefaultUser() {
  try {
    const defaultEmail = "demo@tripvault.com";
    const existing = await User.findOne({ email: defaultEmail });

    if (existing) {
      return;
    }

    const defaultUser = new User({
      Username: "TripVault Demo",
      username: "TripVault Demo",
      name: "TripVault Demo",
      email: defaultEmail,
      password: await bcrypt.hash("TripVault@123", 10),
      bio: "Default demo traveler account for TripVault.",
    });

    await defaultUser.save();
    console.log("Demo user created: demo@tripvault.com / TripVault@123");
  } catch (error) {
    console.error("Demo user seed failed:", error.message);
  }
}

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(async () => {
    console.log("MongoDB Connected");
    await seedDefaultUser();
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    console.error(
      "Please check that your Atlas cluster allows your current IP and that your MONGO_URI is correct."
    );
  });

mongoose.connection.on("error", (err) => {
  console.error("MongoDB runtime error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/trips", require("./routes/trips"));
app.use("/api/users", require("./routes/users"));

app.get("/", (req, res) => {
  res.send("TripVault Backend Running");
});




const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// app.listen(PORT, () => {
//   console.log(`Server running on ${PORT}`);
// });
