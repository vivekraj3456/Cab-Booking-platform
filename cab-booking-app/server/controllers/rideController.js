const Ride = require("../models/Ride");

/* ================= CREATE RIDE ================= */
exports.createRide = async (req, res) => {
  try {
    const {
      mode,               // "cab" | "bike"
      rideType,           // Mini / SUV / Bike / Rental Bike
      pickup,
      drop,
      rentalStart,
      rentalEnd,
      fare,
      paymentMethod,
    } = req.body;

    // 🔒 BASIC VALIDATION
    if (!mode || !rideType || !fare || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🚕 NORMAL RIDE VALIDATION
    if (!rideType.toLowerCase().includes("rental") && (!pickup || !drop)) {
      return res.status(400).json({ message: "Pickup and drop required" });
    }

    // ⏱ RENTAL VALIDATION
    if (
      rideType.toLowerCase().includes("rental") &&
      (!rentalStart || !rentalEnd || rentalEnd <= rentalStart)
    ) {
      return res.status(400).json({ message: "Invalid rental time" });
    }

    const ride = await Ride.create({
      user: req.user.id,
      mode,
      rideType,
      pickup: pickup || null,
      drop: drop || null,
      rentalStart: rentalStart || null,
      rentalEnd: rentalEnd || null,
      fare,
      paymentMethod,
      status: "CURRENT",
    });

    res.status(201).json(ride);
  } catch (err) {
    console.error("Create ride error:", err);
    res.status(500).json({ message: "Failed to create ride" });
  }
};

/* ================= GET USER RIDES ================= */
exports.getMyRides = async (req, res) => {
  try {
    const rides = await Ride.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch rides" });
  }
};

/* ================= UPDATE RIDE STATUS ================= */
exports.updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    ride.status = status;
    await ride.save();

    res.json(ride);
  } catch (err) {
    res.status(500).json({ message: "Failed to update ride" });
  }
};
