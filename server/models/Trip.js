// const mongoose = require("mongoose");

// const tripSchema = new mongoose.Schema(
//   {
//     // Trip name
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // Where the user travelled
//     destination: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // Trip start date
//     startDate: {
//       type: Date,
//     },

//     // Trip end date
//     endDate: {
//       type: Date,
//     },

//     // Trip description
//     description: {
//       type: String,
//       trim: true,
//     },

//     // Rating from 1 to 5
//     rating: {
//       type: Number,
//       min: 1,
//       max: 5,
//     },

//     // Optional trip photo URL
//     photoUrl: {
//       type: String,
//       trim: true,
//       default: "",
//     },

//     // Connect Trip with User
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     coverImage: {
//        type: String,
//        default: "",
//     },

//     photos: {
//       type: [String],
//       default: []
//    },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("Trip", tripSchema);

const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    // Trip name
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Where the user travelled
    destination: {
      type: String,
      required: true,
      trim: true,
    },

    // Trip start date
    startDate: {
      type: Date,
    },

    // Trip end date
    endDate: {
      type: Date,
    },

    // Trip description
    description: {
      type: String,
      trim: true,
    },

    // Rating from 1 to 5
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    // Cover photo
    photoUrl: {
      type: String,
      trim: true,
      default: "",
    },

    coverImage: {
      type: String,
      trim: true,
      default: "",
    },

    // All uploaded photos
    photos: {
      type: [String],
      default: [],
    },

    // Connect Trip with User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trip", tripSchema);