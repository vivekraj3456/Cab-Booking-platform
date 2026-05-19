const express = require("express");
const {
  createRide,
  getMyRides,
  updateRideStatus,
} = require("../controllers/rideController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, createRide);
router.get("/my", auth, getMyRides);
router.put("/:id/status", auth, updateRideStatus);

module.exports = router;
