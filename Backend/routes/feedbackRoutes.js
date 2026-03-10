const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getFeedbacks,
  getFeedbackByRide,
  getRiderFeedbacks,
  deleteFeedback
} = require("../controllers/feedbackController");

// CREATE
router.post("/", createFeedback);

// READ ALL
router.get("/", getFeedbacks);

// GET BY RIDE
router.get("/ride/:rideId", getFeedbackByRide);

// GET RIDER FEEDBACKS
router.get("/rider/:riderId", getRiderFeedbacks);

// DELETE
router.delete("/:id", deleteFeedback);

module.exports = router;
