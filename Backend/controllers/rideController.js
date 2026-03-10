const Ride = require("../models/Ride");

// CREATE (book ride)
exports.createRide = async (req, res) => {
  try {
    const ride = await Ride.create(req.body);
    const populatedRide = await Ride.findById(ride._id)
      .populate("userId", "-password")
      .populate("riderId", "-password");

    res.status(201).json(populatedRide);
  } catch (error) {
    res.status(500).json({ 
      message: "Error creating ride", 
      error: error.message 
    });
  }
};

// READ ALL
exports.getRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate("userId", "-password")
      .populate("riderId", "-password")
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching rides", 
      error: error.message 
    });
  }
};

// READ ONE
exports.getRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("userId", "-password")
      .populate("riderId", "-password");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.json(ride);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching ride", 
      error: error.message 
    });
  }
};

// UPDATE
exports.updateRide = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("userId", "-password")
      .populate("riderId", "-password");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.json(ride);
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating ride", 
      error: error.message 
    });
  }
};

// DELETE
exports.deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndDelete(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.json({ message: "Ride deleted successfully" });
  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting ride", 
      error: error.message 
    });
  }
};