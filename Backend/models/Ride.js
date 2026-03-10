const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rider"
  },
  pickupLocation: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    address: String
  },
  dropoffLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "in-progress", "completed", "cancelled"],
    default: "pending"
  },
  fare: {
    type: Number,
    default: 0
  },
  distance: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "upi"],
    default: "cash"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Ride", rideSchema);