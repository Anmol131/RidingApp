const express = require("express");
const router = express.Router();

const {
  getAllLocations,
  createLocation,
  seedLocations,
  calculateFare
} = require("../controllers/locationController");

// GET ALL LOCATIONS
router.get("/", getAllLocations);

// SEED LOCATIONS (run once to populate database)
router.post("/seed", seedLocations);

// CREATE LOCATION
router.post("/", createLocation);

// CALCULATE FARE
router.get("/calculate-fare", calculateFare);

module.exports = router;
