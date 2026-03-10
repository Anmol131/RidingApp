const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  phone: {
    type: String,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ["bike", "car", "auto"],
    default: "car"
  },
  vehicleNumber: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  location: {
    lat: Number,
    lng: Number
  },
  rating: {
    type: Number,
    default: 5,
    min: 0,
    max: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Rider", riderSchema);