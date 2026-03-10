const Rider = require("../models/Rider");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// LOGIN
exports.loginRider = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if rider exists
    const rider = await Rider.findOne({ email });
    if (!rider) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, rider.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: rider._id, email: rider.email, type: "rider" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password from response
    const riderResponse = rider.toObject();
    delete riderResponse.password;

    res.json({
      message: "Login successful",
      token,
      rider: riderResponse
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error logging in", 
      error: error.message 
    });
  }
};

// CREATE
exports.createRider = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if rider already exists
    const existingRider = await Rider.findOne({ email });
    if (existingRider) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create rider with hashed password
    const rider = await Rider.create({
      ...req.body,
      password: hashedPassword
    });

    // Remove password from response
    const riderResponse = rider.toObject();
    delete riderResponse.password;

    res.status(201).json(riderResponse);
  } catch (error) {
    res.status(500).json({ 
      message: "Error creating rider", 
      error: error.message 
    });
  }
};

// READ ALL
exports.getRiders = async (req, res) => {
  try {
    const riders = await Rider.find().select("-password");
    res.json(riders);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching riders", 
      error: error.message 
    });
  }
};

// READ ONE
exports.getRider = async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id).select("-password");
    
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    res.json(rider);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching rider", 
      error: error.message 
    });
  }
};

// UPDATE
exports.updateRider = async (req, res) => {
  try {
    // If password is being updated, hash it
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const rider = await Rider.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select("-password");

    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    res.json(rider);
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating rider", 
      error: error.message 
    });
  }
};

// DELETE
exports.deleteRider = async (req, res) => {
  try {
    const rider = await Rider.findByIdAndDelete(req.params.id);

    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    res.json({ message: "Rider deleted successfully" });
  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting rider", 
      error: error.message 
    });
  }
};