const express = require("express");
const router = express.Router();

const {
  loginUser,
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require("../controllers/userController");

// LOGIN
router.post("/login", loginUser);

// CREATE
router.post("/", createUser);

// READ ALL
router.get("/", getUsers);

// READ ONE
router.get("/:id", getUser);

// UPDATE
router.put("/:id", updateUser);

// DELETE
router.delete("/:id", deleteUser);

module.exports = router;