const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    // Logged-in user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // cab | bike
    mode: {
      type: String,
      enum: ["cab", "bike"],
      required: true,
    },

    // Mini | Sedan | SUV | Luxury | Bike | Scooty | Rental Bike | Rental Scooty
    rideType: {
      type: String,
      required: true,
    },

    // For normal rides
    pickup: {
      type: String,
      default: null,
    },

    drop: {
      type: String,
      default: null,
    },

    // For rentals
    rentalStart: {
      type: Number,
      default: null,
    },

    rentalEnd: {
      type: Number,
      default: null,
    },

    // Fare calculated on frontend
    fare: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card"],
      required: true,
    },

    status: {
      type: String,
      enum: ["CURRENT", "COMPLETED", "CANCELLED"],
      default: "CURRENT",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ride", rideSchema);
