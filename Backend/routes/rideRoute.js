const express = require("express");
const router = express.Router();

const {
  createRide,
  getRides,
  getRide,
  updateRide,
  deleteRide
} = require("../controllers/rideController");

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