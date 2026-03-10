const Location = require("../models/Location");

// GET ALL LOCATIONS
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true }).sort({ name: 1 });
    res.json({ locations });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching locations", 
      error: error.message 
    });
  }
};

// CREATE LOCATION (for admin/seeding)
exports.createLocation = async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ 
      message: "Error creating location", 
      error: error.message 
    });
  }
};

// SEED INITIAL LOCATIONS
exports.seedLocations = async (req, res) => {
  try {
    // Check if locations already exist
    const count = await Location.countDocuments();
    if (count > 0) {
      return res.json({ message: "Locations already seeded", count });
    }

    const kathmanduLocations = [
      { name: "Thamel", address: "Thamel, Kathmandu", lat: 27.7172, lng: 85.3240 },
      { name: "Durbar Square", address: "Kathmandu Durbar Square", lat: 27.7056, lng: 85.3079 },
      { name: "Patan", address: "Patan, Lalitpur", lat: 27.6731, lng: 85.3250 },
      { name: "Bhaktapur", address: "Bhaktapur Durbar Square", lat: 27.6710, lng: 85.4298 },
      { name: "Boudhanath", address: "Boudhanath Stupa", lat: 27.7215, lng: 85.3620 },
      { name: "Swayambhunath", address: "Swayambhunath Temple", lat: 27.7148, lng: 85.2887 },
      { name: "New Baneshwor", address: "New Baneshwor", lat: 27.6954, lng: 85.3295 },
      { name: "Maharajgunj", address: "Maharajgunj", lat: 27.7350, lng: 85.3260 },
      { name: "Balaju", address: "Balaju", lat: 27.7380, lng: 85.3020 },
      { name: "Chabahil", address: "Chabahil", lat: 27.7240, lng: 85.3490 }
    ];

    const locations = await Location.insertMany(kathmanduLocations);
    res.status(201).json({ 
      message: "Locations seeded successfully", 
      count: locations.length,
      locations 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error seeding locations", 
      error: error.message 
    });
  }
};

// CALCULATE FARE between two location IDs
exports.calculateFare = async (req, res) => {
  try {
    const { pickupId, dropoffId } = req.query;

    if (!pickupId || !dropoffId) {
      return res.status(400).json({ message: "Pickup and dropoff location IDs required" });
    }

    const pickup = await Location.findById(pickupId);
    const dropoff = await Location.findById(dropoffId);

    if (!pickup || !dropoff) {
      return res.status(404).json({ message: "Location not found" });
    }

    // Calculate distance using Haversine formula
    const R = 6371; // Radius of Earth in km
    const dLat = (dropoff.lat - pickup.lat) * Math.PI / 180;
    const dLng = (dropoff.lng - pickup.lng) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pickup.lat * Math.PI / 180) * Math.cos(dropoff.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = Math.round(R * c * 100) / 100;
    
    // Calculate fare
    const baseFare = 100;
    const perKmRate = 25;
    const fare = Math.round(baseFare + (distance * perKmRate));

    res.json({
      pickup,
      dropoff,
      distance,
      fare
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error calculating fare", 
      error: error.message 
    });
  }
};
