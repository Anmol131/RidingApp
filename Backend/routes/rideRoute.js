const express = require("express");
const router = express.Router();

const {
  createRide,
  getRides,
  getRide,
  updateRide,
  deleteRide,
  getRandomLocations
} = require("../controllers/rideController");

// GET RANDOM LOCATIONS (for demo)
router.get("/random-locations", getRandomLocations);

// CREATE
router.post("/", createRide);

// READ ALL
router.get("/", getRides);

// READ ONE
router.get("/:id", getRide);

// UPDATE
router.put("/:id", updateRide);

// DELETE
router.delete("/:id", deleteRide);

module.exports = router;