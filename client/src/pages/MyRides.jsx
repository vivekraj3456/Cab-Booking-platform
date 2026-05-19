import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getMyRides, updateRideStatus } from "../services/api";


function MyRides() {
  const { user } = useContext(AuthContext);
  const [rides, setRides] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const res = await getMyRides();
        setRides(res.data || []);
      } catch (error) {
        setMessage("Failed to load rides");
      }
    };

    if (user) {
      fetchRides();
    }
  }, [user]);
const handleStatusChange = async (rideId, status) => {
  try {
    await updateRideStatus(rideId, status);

    // 🔄 Refresh rides after update
    const res = await getMyRides();
    setRides(res.data);
  } catch (err) {
    console.error("Failed to update ride status");
  }
};

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">
          Please login to view your rides.
        </p>
      </div>
    );
  }

  const currentRides = rides.filter((r) => r.status === "CURRENT");
  const completedRides = rides.filter((r) => r.status === "COMPLETED");
  const cancelledRides = rides.filter((r) => r.status === "CANCELLED");

  return (
    <div className="min-h-screen px-6 py-24 bg-gray-100">
      <div className="max-w-6xl mx-auto">

        {/* HEADING */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold mb-4">My Rides</h2>
          <p className="text-gray-600">
            View and track all your booked rides
          </p>
        </div>

        {message && (
          <p className="text-center text-red-600 mb-6">{message}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* CURRENT RIDES */}
          <RideColumn
            title="🚕 Current Rides"
            rides={currentRides}
            emptyText="No active rides"
          />

          {/* COMPLETED RIDES */}
          <RideColumn
            title="✅ Completed Rides"
            rides={completedRides}
            emptyText="No completed rides yet"
          />

          {/* CANCELLED RIDES */}
          <RideColumn
            title="❌ Cancelled Rides"
            rides={cancelledRides}
            emptyText="No cancelled rides"
          />

        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE COLUMN ================= */

const RideColumn = ({ title, rides, emptyText }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <h3 className="text-2xl font-bold mb-6">{title}</h3>

      {rides.length === 0 ? (
        <p className="text-gray-500 text-center py-10">{emptyText}</p>
      ) : (
        rides.map((ride) => (
          <div
            key={ride._id}
            className="bg-gray-50 rounded-xl p-5 mb-4 shadow"
          >
            <p className="font-semibold">
              {ride.rideType} Ride
            </p>

            <p className="text-sm text-gray-600">
              {ride.pickup} → {ride.drop}
            </p>

            <p className="text-xs text-gray-500 mt-2">
              {new Date(ride.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default MyRides;
