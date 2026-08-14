const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  Username: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },

  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },

  name: {
    type: String,
    default: "",
    trim: true,
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  bio: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("User", UserSchema);