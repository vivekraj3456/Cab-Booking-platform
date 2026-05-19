import { useState, useContext } from "react";
import { createRide } from "../services/api";
import { AuthContext } from "../context/AuthContext";

function Ride() {
  const { user } = useContext(AuthContext);

  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [message, setMessage] = useState("");

  if (!user) {
    return <p>Please login to book a ride.</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRide({
        userId: user._id,
        pickupLocation,
        dropLocation,
      });
      setMessage("Ride booked successfully");
      setPickupLocation("");
      setDropLocation("");
    } catch (error) {
      setMessage("Failed to book ride");
    }
  };

  return (
    <div>
      <h2>Book a Cab</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Pickup Location"
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
        />
        <input
          placeholder="Drop Location"
          value={dropLocation}
          onChange={(e) => setDropLocation(e.target.value)}
        />
        <button type="submit">Book Ride</button>
      </form>
    </div>
  );
}

export default Ride;
