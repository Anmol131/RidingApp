const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ride",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rider",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  feedbackType: {
    type: String,
    enum: ["user-to-rider", "rider-to-user"],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Feedback", feedbackSchema);