const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const rideRoutes = require("./routes/rideRoutes");
require("dotenv").config();



const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);

app.use("/api/rides", rideRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Cab Booking API is running");
});

// Server start
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
