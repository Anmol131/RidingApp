const Feedback = require("../models/Feedback");
const Rider = require("../models/Rider");

// CREATE FEEDBACK
exports.createFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
    
    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate("userId", "-password")
      .populate("riderId", "-password")
      .populate("rideId");

    // Update rider rating if feedback is for rider
    if (req.body.feedbackType === "user-to-rider") {
      const allRiderFeedbacks = await Feedback.find({ 
        riderId: req.body.riderId,
        feedbackType: "user-to-rider"
      });
      
      const avgRating = allRiderFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allRiderFeedbacks.length;
      
      await Rider.findByIdAndUpdate(req.body.riderId, {
        rating: avgRating.toFixed(1)
      });
    }

    res.status(201).json(populatedFeedback);
  } catch (error) {
    res.status(500).json({ 
      message: "Error creating feedback", 
      error: error.message 
    });
  }
};

// GET ALL FEEDBACKS
exports.getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("userId", "-password")
      .populate("riderId", "-password")
      .populate("rideId")
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching feedbacks", 
      error: error.message 
    });
  }
};

// GET FEEDBACK BY RIDE
exports.getFeedbackByRide = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ rideId: req.params.rideId })
      .populate("userId", "-password")
      .populate("riderId", "-password");

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching feedback", 
      error: error.message 
    });
  }
};

// GET FEEDBACKS FOR A RIDER
exports.getRiderFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ 
      riderId: req.params.riderId,
      feedbackType: "user-to-rider"
    })
      .populate("userId", "-password")
      .populate("rideId")
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching rider feedbacks", 
      error: error.message 
    });
  }
};

// DELETE FEEDBACK
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting feedback", 
      error: error.message 
    });
  }
};
