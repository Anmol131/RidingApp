const express = require("express");
const router = express.Router();

const {
  loginRider,
  createRider,
  getRiders,
  getRider,
  updateRider,
  deleteRider
} = require("../controllers/riderController");

// LOGIN
router.post("/login", loginRider);

// CREATE
router.post("/", createRider);

// READ ALL
router.get("/", getRiders);

// READ ONE
router.get("/:id", getRider);

// UPDATE
router.put("/:id", updateRider);

// DELETE
router.delete("/:id", deleteRider);

module.exports = router;