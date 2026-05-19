import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { updateRideStatus } from "../services/api";


import { Link } from "react-router-dom";
import api, { createRide } from "../services/api";
import { AuthContext } from "../context/AuthContext";



/* ================= NAV ITEM ================= */
const NavItem = ({ to, label }) => {
  const handleHover = (e) => {
    const indicator = document.getElementById("liquid-indicator");
    if (!indicator) return;

    const rect = e.target.getBoundingClientRect();
    const parentRect = e.target.parentElement.getBoundingClientRect();

    indicator.style.width = `${rect.width}px`;
    indicator.style.transform = `translateX(${rect.left - parentRect.left}px)`;
  };
 

  return (
    <Link to={to} className="nav-item" onMouseEnter={handleHover}>
      {label}
    </Link>
  );
};

function Home() {
  /* ================= AUTH ================= */
  const { user, logout } = useContext(AuthContext);
  const isLoggedIn = !!user;
  const navigate = useNavigate();

  /* ================= BOOKING STATE ================= */
const [showBookingPopup, setShowBookingPopup] = useState(false);
const [bookingStage, setBookingStage] = useState("searching");
const [progress, setProgress] = useState(0);
const [popupType, setPopupType] = useState(null);
// "login" | "cash" | "upi" | "upiTimer" | "card" | "final"
const [pendingPayload, setPendingPayload] = useState(null);

const [countdown, setCountdown] = useState(5);
const [finalMessage, setFinalMessage] = useState("");

  const [formError, setFormError] = useState("");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [isPickupOpen, setIsPickupOpen] = useState(false);
const [isDropOpen, setIsDropOpen] = useState(false);

  const [activeBooking, setActiveBooking] = useState(null); 
// null | "cab" | "bike"

const [cabType, setCabType] = useState("Mini");
const [paymentMethod, setPaymentMethod] = useState("cash");
const [animateBooking, setAnimateBooking] = useState(false);
const [isCabDropdownOpen, setIsCabDropdownOpen] = useState(false);

const [bikeType, setBikeType] = useState("Bike");
const [previewBikeType, setPreviewBikeType] = useState(null);
const [isBikeDropdownOpen, setIsBikeDropdownOpen] = useState(false);
const isCabRental = cabType === "Rental";
const isBikeRental = bikeType.includes("Rental");



const [previewCabType, setPreviewCabType] = useState(null);
const displayedCabType = previewCabType || cabType;
const displayedBikeType = previewBikeType || bikeType;
const [rentalStart, setRentalStart] = useState("");
const [rentalEnd, setRentalEnd] = useState("");

const LOCATIONS = [
  "Lovely Professional University",
  "Law Gate",
  "Green Valley",
  "Phagwara",
  "Jalandhar",
];

const DISTANCES = {
  "Lovely Professional University": {
    "Law Gate": 2,
    "Green Valley": 3,
    "Phagwara": 10,
    "Jalandhar": 15,
  },
  "Law Gate": {
    "Lovely Professional University": 2,
    "Green Valley": 1,
    "Phagwara": 12,
    "Jalandhar": 14,
  },
  "Green Valley": {
    "Lovely Professional University": 3,
    "Law Gate": 1,
    "Phagwara": 12,
    "Jalandhar": 16,
  },
  "Phagwara": {
    "Lovely Professional University": 10,
    "Law Gate": 11,
    "Green Valley": 12,
    "Jalandhar": 25,
  },
  "Jalandhar": {
    "Lovely Professional University": 15,
    "Law Gate": 14,
    "Green Valley": 16,
    "Phagwara": 25,
  },
};

const CAB_RATE = {
  Mini: 30 ,
  Sedan: 35,
  SUV: 40,
  Luxury: 50,
};

const BIKE_RATE = {
  Bike: 15,
  Scooty: 10,
};
const calculateRentalHours = (start, end) => {
  if (!start || !end) return 0;
  return Math.max(0, end - start);
};
const calculateRentalFare = ({
  rentalStart,
  rentalEnd,
  vehicleType,
  mode, // "cab" | "bike"
}) => {
  const hours = calculateRentalHours(rentalStart, rentalEnd);

  if (hours <= 0) return 0;

  if (mode === "cab") {
    return hours * 100; // ₹100/hour for cars
  }

  if (mode === "bike") {
    if (vehicleType === "Scooty" || vehicleType === "Rental Scooty") {
      return hours * 20; // ₹20/hour
    }
    return hours * 25; // ₹25/hour for bikes
  }

  return 0;
};






const bikeImageKey = displayedBikeType
  .toLowerCase()
  .replace(" ", "-");


const calculateFare = ({
  pickup,
  drop,
  vehicleType,
  mode, // "cab" | "bike"
}) => {
  if (!pickup || !drop || pickup === drop) return null;

  const distance = DISTANCES[pickup]?.[drop];
  if (!distance) return null;

  if (mode === "cab") {
    return distance * CAB_RATE[vehicleType];
  }

  if (mode === "bike") {
    return distance * BIKE_RATE[vehicleType];
  }

  return null;
};


  /* ================= RIDES ================= */
  const [myRides, setMyRides] = useState([]);

  const currentRides = myRides.filter((r) => r.status === "CURRENT");
  const completedRides = myRides.filter((r) => r.status === "COMPLETED");
  const cancelledRides = myRides.filter((r) => r.status === "CANCELLED");

  /* ================= FETCH RIDES ================= */
  const fetchMyRides = async () => {
    try {
      const res = await api.get("/rides/my");
      setMyRides(res.data || []);
    } catch {
      console.error("Failed to fetch rides");
    }
  };

const RideColumn = ({
  title,
  emptyTitle,
  emptySub,
  rides,
  showActions = false,
}) => {

  const handleStatusChange = async (rideId, status) => {
    try {
      await updateRideStatus(rideId, status);
      window.location.reload(); // refresh columns
    } catch (err) {
      console.error("Failed to update ride status", err);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-white">
      <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
        {title}
      </h3>

      {rides.length === 0 ? (
        <div className="text-center py-16 text-white/70">
          <p className="font-medium mb-2">{emptyTitle}</p>
          <p className="text-sm">{emptySub}</p>
        </div>
      ) : (
        rides.map((ride) => (
          <div
            key={ride._id}
            className="bg-black/40 backdrop-blur-md rounded-2xl p-5 mb-4 border border-white/10"
          >
            <p className="font-semibold mb-1">
              {ride.rideType} Ride
            </p>

            <p className="text-sm text-white/70">
              {ride.pickup} → {ride.drop}
            </p>

            <p className="text-xs text-white/50 mt-2">
              {new Date(ride.createdAt).toLocaleString()}
            </p>

            {showActions && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleStatusChange(ride._id, "COMPLETED")}
                  className="flex-1 bg-green-500 text-black py-2 rounded-xl font-semibold transition hover:brightness-110"
                >
                  Complete
                </button>

                <button
                  onClick={() => handleStatusChange(ride._id, "CANCELLED")}
                  className="flex-1 bg-red-500 text-black py-2 rounded-xl font-semibold transition hover:brightness-110"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};



  /* ================= BOOKING HANDLERS ================= */
const handleCabBooking = async () => {
  // 🔒 LOGIN CHECK
  if (!isLoggedIn) {
    setPopupType("login");
    setShowBookingPopup(true);
    return;
  }

  // ❌ VALIDATIONS
  if (!cabType) {
    setFormError("Select cab type");
    return;
  }

  if (!isCabRental && (!pickup || !drop)) {
    setFormError("Select pickup and drop locations");
    return;
  }

  if (isCabRental && (!rentalStart || !rentalEnd || rentalEnd <= rentalStart)) {
    setFormError("Select valid rental time");
    return;
  }

  setFormError("");

  // 💰 FARE CALCULATION
  const fare = isCabRental
    ? calculateRentalFare({
        rentalStart,
        rentalEnd,
        vehicleType: cabType,
        mode: "cab",
      })
    : calculateFare({
        pickup,
        drop,
        vehicleType: cabType,
        mode: "cab",
      });

  // 📦 SAVE PAYLOAD FOR FINAL BOOKING
setPendingPayload({
  mode: "cab",
  rideType: cabType,
  pickup: isCabRental ? null : pickup,
  drop: isCabRental ? null : drop,
  rentalStart: isCabRental ? rentalStart : null,
  rentalEnd: isCabRental ? rentalEnd : null,
  fare,
  paymentMethod,
});

  // 💳 PAYMENT FLOW DECISION
  if (paymentMethod === "cash") {
    setFinalMessage(
      `Confirming your ride. Pay ₹${fare} in cash to the driver.`
    );
    setPopupType("cash");
    setShowBookingPopup(true);
    return;
  }

  if (paymentMethod === "upi") {
    setPopupType("upi");
    setShowBookingPopup(true);
    return;
  }

  if (paymentMethod === "card") {
    setPopupType("card");
    setShowBookingPopup(true);
    return;
  }
};
const handleBikeBooking = async () => {
  // 🔒 LOGIN CHECK
  if (!isLoggedIn) {
    setPopupType("login");
    setShowBookingPopup(true);
    return;
  }

  // ❌ VALIDATIONS
  if (!bikeType) {
    setFormError("Select bike type");
    return;
  }

  if (!isBikeRental && (!pickup || !drop)) {
    setFormError("Select pickup and drop locations");
    return;
  }

  if (isBikeRental && (!rentalStart || !rentalEnd || rentalEnd <= rentalStart)) {
    setFormError("Select valid rental time");
    return;
  }

  setFormError("");

  // 💰 FARE CALCULATION
  const fare = isBikeRental
    ? calculateRentalFare({
        rentalStart,
        rentalEnd,
        vehicleType: bikeType,
        mode: "bike",
      })
    : calculateFare({
        pickup,
        drop,
        vehicleType: bikeType,
        mode: "bike",
      });

setPendingPayload({
  mode: "bike",
  rideType: bikeType,
  pickup: isBikeRental ? null : pickup,
  drop: isBikeRental ? null : drop,
  rentalStart: isBikeRental ? rentalStart : null,
  rentalEnd: isBikeRental ? rentalEnd : null,
  fare,
  paymentMethod,
});


  // 💳 PAYMENT FLOW DECISION
  if (paymentMethod === "cash") {
    setFinalMessage(
      `Confirming your ride. Pay ₹${fare} in cash to the driver.`
    );
    setPopupType("cash");
    setShowBookingPopup(true);
    return;
  }

  if (paymentMethod === "upi") {
    setPopupType("upi");
    setShowBookingPopup(true);
    return;
  }

  if (paymentMethod === "card") {
    setPopupType("card");
    setShowBookingPopup(true);
    return;
  }
};
const startBookingFlow = async () => {
  try {
    setShowBookingPopup(true);
    setPopupType("booking");

    // STEP 1 — Searching (5s)
    setBookingStage("searching");
    setProgress(0);

    let p = 0;
    const searchTimer = setInterval(() => {
      p += 20;
      setProgress(p);
      if (p >= 100) clearInterval(searchTimer);
    }, 1000);

    await new Promise((res) => setTimeout(res, 5000));

    // STEP 2 — Confirming
    setBookingStage("confirming");
    setProgress(70);

    await new Promise((res) => setTimeout(res, 2000));

    // STEP 3 — BACKEND SAVE
    await createRide(pendingPayload);

    // STEP 4 — BOOKED
    setBookingStage("booked");
    setProgress(100);

    fetchMyRides();

  } catch (err) {
    console.error(err);
    setFormError("Booking failed. Please try again.");
    setShowBookingPopup(false);
  }
};
/* ================= EFFECTS ================= */

// 🔹 Fetch rides after login
useEffect(() => {
  if (isLoggedIn) {
    fetchMyRides();
  }
}, [isLoggedIn]);

// 🔹 Navbar liquid indicator init
useEffect(() => {
  const first = document.querySelector(".nav-item");
  if (first) {
    first.dispatchEvent(new Event("mouseenter"));
  }
}, []);

// 🔹 Pickup / Drop validation
useEffect(() => {
  if (pickup && drop && pickup === drop) {
    setFormError("Pickup and Drop location cannot be the same");
  } else {
    setFormError("");
  }
}, [pickup, drop]);

// 🔹 UPI payment countdown → then booking flow
useEffect(() => {
  if (popupType !== "upiTimer") return;

  setCountdown(5);

  const timer = setInterval(() => {
    setCountdown((prev) => {
      if (prev === 1) {
        clearInterval(timer);
        startBookingFlow(); // ✅ unified booking flow
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [popupType]);


  
  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100
      "
    >
      {/* ================= NAVBAR ================= */}
      <nav className="absolute top-0 left-0 w-full pt-6 z-20">

        {/* LOGO — LEFT */}
        <Link to="/" className="absolute left-6 top-6 z-30 flex items-center">
          <span className="text-2xl font-bold text-white tracking-wide">
            RideIT
          </span>
        </Link>

        {/* CENTER NAVIGATION PILL */}
        <div className="flex justify-center">
          <div className="relative flex items-center gap-8 px-10 py-3 rounded-full glass-nav">

            {/* LIQUID INDICATOR */}
            <span id="liquid-indicator" className="liquid-indicator" />

            <NavItem to="/" label="Home" />
            <NavItem to="/ride" label="Book Ride" />
            {isLoggedIn && <NavItem to="/my-rides" label="My Rides" />}
            <NavItem to="/about" label="About Us" />
            <NavItem to="/safety" label="Safety" />
          </div>
        </div>

        {/* RIGHT AUTH PILL */}
        <div className="absolute right-6 top-6">
          <div className="relative flex items-center gap-5 px-4 py-2 rounded-full glass-nav auth-pill">

            {!isLoggedIn ? (
              <>
                <Link to="/login" className="auth-link relative z-10">
                  Log in
                </Link>

                <Link to="/register" className="auth-cta relative z-10">
                  Sign Up
                </Link>

                {/* AUTH LIQUID */}
                <span className="auth-liquid" />
              </>
            ) : (
              <>
                <span className="text-sm font-medium text-white/90">
                  Hi, {user.name}
                </span>

    <button
  onClick={() => {
    logout();
    navigate("/login");
  }}
>
  Logout
</button>

              </>
            )}
          </div>
        </div>
      </nav>


    <section
  id="hero"
  className="min-h-screen flex items-center justify-center px-6 pt-32
  bg-cover bg-center relative overflow-hidden"
  style={{ backgroundImage: "url('/images/ride-hero.jpg')" }}
>


{/* HERO CARD */}
<div
  className="
    relative z-10 max-w-4xl text-center
    bg-white/70 backdrop-blur-md
    rounded-3xl shadow-xl p-12
    transition-all duration-300
  "
>
  <h1 className="text-5xl font-bold mb-6">
    RideIT — Book Your Ride Instantly
  </h1>

  <p className="text-lg text-gray-700 mb-8">
    A modern cab booking platform to book rides, track trips,
    and manage everything from one dashboard.
  </p>

  <div className="flex flex-col sm:flex-row justify-center gap-6">
    <button
      onClick={() =>
        document
          .getElementById("book-ride-section")
          ?.scrollIntoView({ behavior: "smooth" })
      }
      className="
        bg-black text-white px-8 py-4 rounded-full
        font-medium transition-all
        hover:bg-gray-900
      "
    >
      Book a Ride
    </button>

    <Link
      to="/login"
      className="
        bg-white/80 text-black px-8 py-4 rounded-full
        font-medium backdrop-blur-md
        transition-all hover:bg-white
      "
    >
      Become a Driver
    </Link>
  </div>
</div>
</section>
{/* ================= BOOKING SECTION ================= */}
<section
  id="book-ride-section"
  className="min-h-screen flex items-center justify-center px-6
  bg-cover bg-center relative"
  style={{ backgroundImage: "url('/images/booking-bg.jpg')" }}
>
  {/* BACKGROUND OVERLAY — ALWAYS */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>

  {/* EXTRA BLUR WHEN BOOKING ACTIVE */}
  {activeBooking && (
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-10 pointer-events-none"></div>
  )}

  <div className="relative z-20 max-w-7xl w-full">

    {/* HEADING CARD */}
  <div
  className={`text-center mb-20 transition-all duration-500 ${
    activeBooking
      ? "opacity-0 pointer-events-none translate-y-4"
      : "opacity-100"
  }`}
>
  <h2 className="text-6xl font-extrabold text-white drop-shadow-lg mb-4">
    Book Your Ride
  </h2>

  <p className="text-lg text-white/90 max-w-2xl mx-auto">
    Choose a cab for comfort or a bike for instant travel
  </p>
</div>

    {/* TWO BOOKING CARDS BELOW */}

{!activeBooking && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

    {/* CAB */}
    <div
      onClick={() => {
        setActiveBooking("cab");
        setTimeout(() => setAnimateBooking(true), 50);
      }}
      className="cursor-pointer bg-white/70 backdrop-blur-md
      rounded-3xl shadow-xl p-16 text-center
      transition-all duration-300 hover:scale-105"
    >
      <h3 className="text-4xl font-bold mb-4">🚕 Book a Cab</h3>
      <p className="text-gray-600">Comfortable rides for every journey</p>
    </div>

    {/* BIKE */}
    <div
      onClick={() => {
        setActiveBooking("bike");
        setTimeout(() => setAnimateBooking(true), 50);
      }}
      className="cursor-pointer bg-white/70 backdrop-blur-md
      rounded-3xl shadow-xl p-16 text-center
      transition-all duration-300 hover:scale-105"
    >
      <h3 className="text-4xl font-bold mb-4">🏍️ Book a Bike</h3>
      <p className="text-gray-600">Fastest way through traffic</p>
    </div>

  </div>
)}
{activeBooking && (
  <div className="relative flex justify-center">
{activeBooking === "cab" && (
  <div
    className={`
      relative z-20 mx-auto
      transition-all duration-700 ease-out
      ${animateBooking ? "w-full lg:w-[80%]" : "w-[45%]"}
    `}
  >


    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
    {/* LEFT PANEL */}
  <div className="
  bg-black/60 text-white backdrop-blur-xl
  rounded-3xl p-10 shadow-2xl
  transition-all duration-500
">
  <h3 className="text-3xl font-bold mb-6">Book a Cab</h3>
    <button
  onClick={() => {
    setAnimateBooking(false);
    setTimeout(() => setActiveBooking(null), 300);
  }}
  className="absolute top-6 right-6 text-white/70 hover:text-white"
>
  ✕
</button>

  {/* CAB TYPE DROPDOWN */}
{/* CAB TYPE SELECTOR */}



<p className="mb-2 text-sm font-semibold text-gray-300 uppercase tracking-wide">
  Cab Type
</p>
<div className="relative mb-6">
  {/* SELECT BUTTON */}
  <button
    type="button"
    onClick={() => setIsCabDropdownOpen((prev) => !prev)}
    className="w-full px-4 py-3 rounded-xl
    bg-black/40 border border-white/20
    text-left flex justify-between items-center"
  >
    <span>{cabType}</span>
    <span
      className={`transition-transform duration-300 ${
        isCabDropdownOpen ? "rotate-180" : ""
      }`}
    >
      ▾
    </span>
  </button>

  {/* DROPDOWN OPTIONS */}
  {isCabDropdownOpen && (
    
    <div
      className="
        absolute left-0 right-0 mt-2 z-30
        bg-black/80 backdrop-blur-xl
        rounded-xl overflow-hidden
        border border-white/20
      "
      onMouseLeave={() => setPreviewCabType(null)}
    >
      {["Mini", "Sedan", "SUV", "Luxury", "Rental"].map((type) => (
        <div
          key={type}
onMouseEnter={() => {
  setPreviewCabType(null);
  requestAnimationFrame(() => setPreviewCabType(type));
}}
          onClick={() => {
            setCabType(type);              // click → select
            setPreviewCabType(null);       // clear preview
            setIsCabDropdownOpen(false);   // close dropdown
          }}
          className={`px-4 py-3 cursor-pointer
            transition-all duration-200
            ${
              cabType === type
                ? "bg-yellow-500 text-black"
                : "hover:bg-white/10"
            }`}
        >
          {type}
        </div>
      ))}
    </div>
  )}
</div>
{/* LOCATION OR RENTAL TIME */}
{!isCabRental ? (
  <>
{/* PICKUP LOCATION */}
<p className="mb-2 text-sm font-semibold text-gray-300 uppercase tracking-wide">
  Pickup Location
</p>
<div className="relative mb-6">
  <button
    type="button"
    onClick={() => setIsPickupOpen((p) => !p)}
    className="w-full px-4 py-3 rounded-xl
    bg-black/40 border border-white/20
    text-left flex justify-between items-center"
  >
    <span>{pickup || "Select Pickup Location"}</span>
    <span className={`transition-transform ${isPickupOpen ? "rotate-180" : ""}`}>
      ▾
    </span>
  </button>

  {isPickupOpen && (
    <div
      className="
        absolute left-0 right-0 mt-2 z-30
        bg-black/80 backdrop-blur-xl
        rounded-xl overflow-hidden
        border border-white/20
      "
    >
      {LOCATIONS.map((loc) => (
        <div
          key={loc}
          onClick={() => {
            setPickup(loc);
            if (drop === loc) setDrop("");
            setIsPickupOpen(false);
          }}
          className={`px-4 py-3 cursor-pointer transition-all
            ${
              pickup === loc
                ? "bg-yellow-500 text-black"
                : "hover:bg-white/10"
            }`}
        >
          {loc}
        </div>
      ))}
    </div>
  )}
</div>


    {/* DROP LOCATION */}
{/* DROP LOCATION */}
<p className="mb-2 text-sm font-semibold text-gray-300 uppercase tracking-wide">
  Drop Location
</p>
<div className="relative mb-6">
  <button
    type="button"
    onClick={() => setIsDropOpen((p) => !p)}
    className="w-full px-4 py-3 rounded-xl
    bg-black/40 border border-white/20
    text-left flex justify-between items-center"
  >
    <span>{drop || "Select Drop Location"}</span>
    <span className={`transition-transform ${isDropOpen ? "rotate-180" : ""}`}>
      ▾
    </span>
  </button>

  {isDropOpen && (
    <div
      className="
        absolute left-0 right-0 mt-2 z-30
        bg-black/80 backdrop-blur-xl
        rounded-xl overflow-hidden
        border border-white/20
      "
    >
      {LOCATIONS.map((loc) => {
        const isDisabled = loc === pickup;

        return (
          <div
            key={loc}
            onClick={() => {
              if (!isDisabled) {
                setDrop(loc);
                setIsDropOpen(false);
              }
            }}
            className={`px-4 py-3 transition-all
              ${
                isDisabled
                  ? "bg-black/30 text-gray-500 cursor-not-allowed"
                  : drop === loc
                  ? "bg-yellow-500 text-black cursor-pointer"
                  : "hover:bg-white/10 cursor-pointer"
              }`}
          >
            {loc}
            {isDisabled && (
              <span className="ml-2 text-xs">(Pickup)</span>
            )}
          </div>
        );
      })}
    </div>
  )}
</div>

  </>
) : (
  /* RENTAL TIME */
  <div className="grid grid-cols-2 gap-4 mb-6">
    <select
      value={rentalStart}
      onChange={(e) => setRentalStart(e.target.value)}
      className="px-4 py-3 rounded-xl bg-black/40 border border-white/20"
    >
      <option value="">From</option>
      {[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23].map(t => (
        <option key={t} value={t}>{t}:00</option>
      ))}
    </select>

    <select
      value={rentalEnd}
      onChange={(e) => setRentalEnd(e.target.value)}
      className="px-4 py-3 rounded-xl bg-black/40 border border-white/20"
    >
      <option value="">To</option>
      {[8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23].map(t => (
        <option key={t} value={t}>{t}:00</option>
      ))}
    </select>
  </div>
)}

{/* PAYMENT */}
<div className="mb-6">
  <p className="mb-3 font-semibold">Payment Method</p>
  <div className="flex gap-3">
    {["cash", "card", "upi"].map((method) => (
      <button
        key={method}
        onClick={() => setPaymentMethod(method)}
        className={`px-5 py-2 rounded-full border transition-all
          ${
            paymentMethod === method
              ? "bg-yellow-500 text-black border-yellow-500"
              : "border-white/30 hover:border-yellow-500"
          }`}
      >
        {method.toUpperCase()}
      </button>
    ))}
  </div>
</div>

{/* FARE / RENT PREVIEW — SINGLE BOX */}
{(
  (!isCabRental && pickup && drop && DISTANCES[pickup]?.[drop]) ||
  (isCabRental && rentalStart && rentalEnd && rentalEnd > rentalStart)
) && (
  <div className="mb-4 p-4 rounded-xl bg-black/40 border border-white/20 text-center">
    
    {!isCabRental ? (
      <>
        <p className="text-sm text-gray-300">
          Distance: {DISTANCES[pickup][drop]} km
        </p>
        <p className="text-lg font-semibold text-green-400">
          Estimated Fare: ₹
          {calculateFare({
            pickup,
            drop,
            vehicleType: cabType,
            mode: "cab",
          })}
        </p>
      </>
    ) : (
      <>
        <p className="text-sm text-gray-300">
          Duration: {rentalEnd - rentalStart} hours
        </p>
        <p className="text-lg font-semibold text-green-400">
          Rental Cost: ₹
          {calculateRentalFare({
            rentalStart,
            rentalEnd,
            vehicleType: cabType,
            mode: "cab",
          })}
        </p>
      </>
    )}

  </div>
)}

{/* CONFIRM BUTTON */}
<button
  onClick={handleCabBooking}
  className="w-full bg-yellow-500 text-black py-4 rounded-full text-lg font-semibold hover:brightness-110"
>
  {isCabRental ? "Rent a Car" : `Book ${cabType} Cab`}
</button>

</div>


    {/* RIGHT PANEL – IMAGE */}
   <div className="
  bg-black/60 backdrop-blur-xl
  rounded-3xl p-6 shadow-2xl
  flex items-center justify-center
  transition-all duration-500
">
 <img
  key={displayedCabType}
  src={`/images/cabs/${displayedCabType.toLowerCase()}.png`}
  alt={displayedCabType}
  className="w-full max-w-sm
  transition-all duration-500
  animate-fadeIn"
/>

</div>

</div>
  </div>
  
)}

{activeBooking === "bike" && (
  <div
    className={`
      relative z-20 mx-auto
      transition-all duration-700 ease-out
      ${animateBooking ? "w-full lg:w-[80%]" : "w-[45%]"}
    `}
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

      {/* LEFT PANEL — BIKE IMAGE */}
      <div
        className="
          bg-black/60 backdrop-blur-xl
          rounded-3xl p-6 shadow-2xl
          flex items-center justify-center
        "
      >
        <img
          key={bikeImageKey}
          src={`/images/bikes/${bikeImageKey}.png`}
          alt={displayedBikeType}
          className="w-full max-w-sm transition-all duration-500 animate-fadeIn"
        />
      </div>

      {/* RIGHT PANEL — BIKE BOOKING */}
      <div
        className="
          bg-black/60 text-white backdrop-blur-xl
          rounded-3xl p-10 shadow-2xl
        "
      >
        <h3 className="text-3xl font-bold mb-6">Book a Bike</h3>
          <button
  onClick={() => {
    setAnimateBooking(false);
    setTimeout(() => setActiveBooking(null), 300);
  }}
  className="absolute top-6 right-6 text-white/70 hover:text-white"
>
  ✕
</button>

        {/* BIKE TYPE DROPDOWN */}
        <div className="relative mb-6">
          <button
            type="button"
            onClick={() => setIsBikeDropdownOpen((p) => !p)}
            className="w-full px-4 py-3 rounded-xl
            bg-black/40 border border-white/20
            text-left flex justify-between items-center"
          >
            <span>{bikeType}</span>
            <span
              className={`transition-transform ${
                isBikeDropdownOpen ? "rotate-180" : ""
              }`}
            >
              ▾
            </span>
          </button>

          {isBikeDropdownOpen && (
            <div
              className="
                absolute left-0 right-0 mt-2 z-30
                bg-black/80 backdrop-blur-xl
                rounded-xl overflow-hidden
                border border-white/20
              "
              onMouseLeave={() => setPreviewBikeType(null)}
            >
              {["Bike", "Scooty", "Rental Bike", "Rental Scooty"].map((type) => (
                <div
                  key={type}
                  onMouseEnter={() => {
                    setPreviewBikeType(null);
                    requestAnimationFrame(() =>
                      setPreviewBikeType(type)
                    );
                  }}
                  onClick={() => {
                    setBikeType(type);
                    setPreviewBikeType(null);
                    setIsBikeDropdownOpen(false);
                  }}
                  className={`px-4 py-3 cursor-pointer transition-all
                    ${
                      bikeType === type
                        ? "bg-yellow-500 text-black"
                        : "hover:bg-white/10"
                    }`}
                >
                  {type}
                </div>
              ))}
            </div>
          )}
        </div>

        
  {/* LOCATION OR RENTAL TIME */}
{!isBikeRental ? (
  <>
    {/* PICKUP LOCATION */}
    <div className="relative mb-6">
      <button
        type="button"
        onClick={() => setIsPickupOpen((p) => !p)}
        className="w-full px-4 py-3 rounded-xl
        bg-black/40 border border-white/20
        text-left flex justify-between items-center"
      >
        <span>{pickup || "Select Pickup Location"}</span>
        <span className={`transition-transform ${isPickupOpen ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {isPickupOpen && (
        <div className="
          absolute left-0 right-0 mt-2 z-30
          bg-black/80 backdrop-blur-xl
          rounded-xl overflow-hidden
          border border-white/20
        ">
          {LOCATIONS.map((loc) => (
            <div
              key={loc}
              onClick={() => {
                setPickup(loc);
                if (drop === loc) setDrop("");
                setIsPickupOpen(false);
              }}
              className={`px-4 py-3 cursor-pointer transition-all
                ${
                  pickup === loc
                    ? "bg-yellow-500 text-black"
                    : "hover:bg-white/10"
                }`}
            >
              {loc}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* DROP LOCATION */}
    <div className="relative mb-6">
      <button
        type="button"
        onClick={() => setIsDropOpen((p) => !p)}
        className="w-full px-4 py-3 rounded-xl
        bg-black/40 border border-white/20
        text-left flex justify-between items-center"
      >
        <span>{drop || "Select Drop Location"}</span>
        <span className={`transition-transform ${isDropOpen ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {isDropOpen && (
        <div className="
          absolute left-0 right-0 mt-2 z-30
          bg-black/80 backdrop-blur-xl
          rounded-xl overflow-hidden
          border border-white/20
        ">
          {LOCATIONS.map((loc) => {
            const isDisabled = loc === pickup;

            return (
              <div
                key={loc}
                onClick={() => {
                  if (!isDisabled) {
                    setDrop(loc);
                    setIsDropOpen(false);
                  }
                }}
                className={`px-4 py-3 transition-all
                  ${
                    isDisabled
                      ? "bg-black/30 text-gray-500 cursor-not-allowed"
                      : drop === loc
                      ? "bg-yellow-500 text-black cursor-pointer"
                      : "hover:bg-white/10 cursor-pointer"
                  }`}
              >
                {loc}
                {isDisabled && (
                  <span className="ml-2 text-xs">(Pickup)</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  </>
) : (
  /* RENTAL TIME */
  <div className="grid grid-cols-2 gap-4 mb-6">
    <select
      value={rentalStart}
      onChange={(e) => setRentalStart(e.target.value)}
      className="px-4 py-3 rounded-xl bg-black/40 border border-white/20"
    >
      <option value="">From</option>
      {[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23].map(t => (
        <option key={t} value={t}>{t}:00</option>
      ))}
    </select>

    <select
      value={rentalEnd}
      onChange={(e) => setRentalEnd(e.target.value)}
      className="px-4 py-3 rounded-xl bg-black/40 border border-white/20"
    >
      <option value="">To</option>
      {[8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23].map(t => (
        <option key={t} value={t}>{t}:00</option>
      ))}
    </select>
  </div>
)}

{/* PAYMENT */}
<div className="mb-6">
  <p className="mb-3 font-semibold">Payment Method</p>
  <div className="flex gap-3">
    {["cash", "card", "upi"].map((method) => (
      <button
        key={method}
        onClick={() => setPaymentMethod(method)}
        className={`px-5 py-2 rounded-full border transition-all
          ${
            paymentMethod === method
              ? "bg-yellow-500 text-black"
              : "border-white/30 hover:border-yellow-500"
          }`}
      >
        {method.toUpperCase()}
      </button>
    ))}
  </div>
</div>

{/* FARE / RENT PREVIEW */}
{(
  (!isBikeRental && pickup && drop && DISTANCES[pickup]?.[drop]) ||
  (isBikeRental && rentalStart && rentalEnd && rentalEnd > rentalStart)
) && (
  <div className="mb-4 p-4 rounded-xl bg-black/40 border border-white/20 text-center">

    {!isBikeRental ? (
      <>
        <p className="text-sm text-gray-300">
          Distance: {DISTANCES[pickup][drop]} km
        </p>
        <p className="text-lg font-semibold text-green-400">
          Estimated Fare: ₹
          {calculateFare({
            pickup,
            drop,
            vehicleType: bikeType,
            mode: "bike",
          })}
        </p>
      </>
    ) : (
      <>
        <p className="text-sm text-gray-300">
          Duration: {rentalEnd - rentalStart} hours
        </p>
        <p className="text-lg font-semibold text-green-400">
          Rental Cost: ₹
          {calculateRentalFare({
            rentalStart,
            rentalEnd,
            vehicleType: bikeType,
            mode: "bike",
          })}
        </p>
      </>
    )}

  </div>
)}

{/* CONFIRM BUTTON */}
<button
  onClick={handleBikeBooking}
  className="w-full bg-yellow-500 text-black py-4 rounded-full text-lg font-semibold hover:brightness-110"
>
  {isBikeRental ? "Rent a Bike" : `Book ${bikeType}`}
</button>


      </div>

    </div>
  </div>
)}
  </div>
)}
</div>
</section>

{formError && (
  <p className="text-center text-red-600 mb-6 font-medium">
    {formError}
  </p>
)}

  {/* ================= MY RIDES SECTION ================= */}
<section
  id="my-rides-section"
  className="min-h-screen px-6 py-28
  bg-cover bg-center relative"
  style={{ backgroundImage: "url('/images/booking-bg.jpg')" }}
>
  {/* BACKGROUND OVERLAY */}
  <div className="absolute inset-0 bg-black/70"></div>

  <div className="relative z-10 max-w-7xl mx-auto">

    {/* ===== HEADING ===== */}
    <div className="text-center mb-20">
      <h2 className="text-6xl font-extrabold text-white mb-4 drop-shadow-xl">
        My Rides
      </h2>
      <p className="text-lg text-white/80 max-w-2xl mx-auto">
        Track your current, completed, and cancelled rides in real time
      </p>
    </div>

    {/* ===== NOT LOGGED IN ===== */}
    {!isLoggedIn ? (
      <div className="max-w-xl mx-auto
        bg-white/10 backdrop-blur-xl
        rounded-3xl shadow-2xl p-12 text-center text-white"
      >
        <h3 className="text-2xl font-bold mb-4">
          Login Required
        </h3>
        <p className="text-white/80 mb-8">
          Please login to view and manage your rides.
        </p>

        <Link
          to="/login"
          className="inline-block bg-yellow-500 text-black
          px-8 py-4 rounded-full font-semibold
          transition hover:brightness-110"
        >
          Login to Continue
        </Link>
      </div>
    ) : (

      /* ===== LOGGED IN VIEW ===== */
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* ================= CURRENT RIDES ================= */}
        <RideColumn
          title="🚕 Current Rides"
          emptyTitle="No active rides"
          emptySub="Your booked rides will appear here"
          rides={currentRides}
          showActions
        />

        {/* ================= COMPLETED RIDES ================= */}
        <RideColumn
          title="✅ Completed Rides"
          emptyTitle="No completed rides"
          emptySub="Finished trips will appear here"
          rides={completedRides}
        />

        {/* ================= CANCELLED RIDES ================= */}
        <RideColumn
          title="❌ Cancelled Rides"
          emptyTitle="No cancelled rides"
          emptySub="Cancelled trips will appear here"
          rides={cancelledRides}
        />

      </div>
    )}
  </div>
</section>



{/* ================= ABOUT US ================= */}
<section
  id="about-us"
  className="relative min-h-screen flex items-center px-6 py-28
  bg-cover bg-center"
  style={{ backgroundImage: "url('/images/booking-bg.jpg')" }}
>
  {/* DARK OVERLAY */}
  <div className="absolute inset-0 bg-black/80"></div>

  <div className="relative z-10 max-w-7xl mx-auto">

    {/* HEADING */}
    <div className="text-center mb-20">
      <h2 className="text-6xl font-extrabold text-white mb-4 drop-shadow-xl">
        About RideIT
      </h2>
      <p className="text-lg text-white/80 max-w-3xl mx-auto">
        Building a smarter, faster, and more reliable way to move around your city
      </p>
    </div>

    {/* CONTENT GRID */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">

      {/* LEFT — TEXT */}
      <div
        className="
          bg-white/10 backdrop-blur-xl
          rounded-3xl shadow-2xl
          p-10 text-white
        "
      >
        <h3 className="text-3xl font-bold mb-6">
          Who We Are
        </h3>

        <p className="text-white/80 leading-relaxed mb-6">
          RideIT is a modern ride-booking platform designed to make
          daily travel simple, affordable, and efficient.
          Whether it’s a cab for comfort, a bike for speed,
          or a rental for flexibility — RideIT puts control in your hands.
        </p>

        <p className="text-white/80 leading-relaxed">
          Built as a real-world inspired project, RideIT focuses on
          clean UI, smooth user experience, and practical backend logic
          to simulate how actual ride-hailing platforms work.
        </p>
      </div>

      {/* RIGHT — HIGHLIGHTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

        {[
          {
            title: "🚕 Smart Booking",
            desc: "Instant cab and bike booking with transparent fare calculation",
          },
          {
            title: "⏱ Flexible Rentals",
            desc: "Hourly rentals for cars, bikes, and scooties",
          },
          {
            title: "📍 Location Based",
            desc: "Predefined city routes for accurate distance and pricing",
          },
          {
            title: "🔐 Secure System",
            desc: "JWT-based authentication with protected ride history",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="
              bg-black/40 backdrop-blur-md
              rounded-2xl p-6
              text-white
              border border-white/10
              transition-all duration-300
              hover:scale-[1.03]
            "
          >
            <h4 className="text-xl font-semibold mb-3">
              {item.title}
            </h4>
            <p className="text-sm text-white/70 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}

      </div>
    </div>

    {/* BOTTOM STAT STRIP */}
    <div
      className="
        mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8
        bg-white/10 backdrop-blur-xl
        rounded-3xl shadow-2xl
        p-10 text-center text-white
      "
    >
      <div>
        <p className="text-4xl font-extrabold mb-2">🚕</p>
        <p className="font-semibold">Cab & Bike Booking</p>
      </div>

      <div>
        <p className="text-4xl font-extrabold mb-2">⏱</p>
        <p className="font-semibold">Hourly Rentals</p>
      </div>

      <div>
        <p className="text-4xl font-extrabold mb-2">📊</p>
        <p className="font-semibold">Ride Tracking Dashboard</p>
      </div>
    </div>

  </div>
</section>


{/* ================= SAFETY ================= */}
<section
  id="safety"
  className="relative min-h-screen flex items-center px-6 py-28
  bg-cover bg-center"
  style={{ backgroundImage: "url('/images/booking-bg.jpg')" }}
>
  {/* OVERLAY */}
  <div className="absolute inset-0 bg-black/85"></div>

  <div className="relative z-10 max-w-7xl mx-auto">

    {/* HEADING */}
    <div className="text-center mb-20">
      <h2 className="text-6xl font-extrabold text-white mb-4 drop-shadow-xl">
        Your Safety, Our Priority
      </h2>
      <p className="text-lg text-white/80 max-w-3xl mx-auto">
        RideIT is designed with built-in safety measures to ensure
        secure, transparent, and controlled rides for every user.
      </p>
    </div>

    {/* SAFETY GRID */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

      {[
        {
          title: "🔐 Verified Access",
          desc: "Only logged-in users can book rides. Authentication ensures accountability and secure ride records.",
        },
        {
          title: "📍 Controlled Locations",
          desc: "Pickup and drop locations are validated to prevent incorrect or unsafe routing.",
        },
        {
          title: "💰 Fare Transparency",
          desc: "Ride cost is calculated and shown before booking. No hidden charges, ever.",
        },
        {
          title: "🕒 Ride Tracking",
          desc: "Users can track current, completed, and cancelled rides with timestamps.",
        },
        {
          title: "🚫 Ride Control",
          desc: "Cancel or complete rides anytime. Users stay in control throughout the journey.",
        },
        {
          title: "🚨 Emergency Awareness",
          desc: "SOS and emergency contact features are conceptually integrated for future scalability.",
        },
      ].map((item, idx) => (
        <div
          key={idx}
          className="
            bg-white/10 backdrop-blur-xl
            rounded-3xl p-8
            text-white
            shadow-2xl
            border border-white/10
            transition-all duration-300
            hover:scale-[1.04]
          "
        >
          <h3 className="text-2xl font-bold mb-4">
            {item.title}
          </h3>
          <p className="text-white/70 leading-relaxed">
            {item.desc}
          </p>
        </div>
      ))}
    </div>

    {/* BOTTOM STRIP */}
    <div
      className="
        mt-20 bg-black/40 backdrop-blur-xl
        rounded-3xl shadow-2xl
        p-10 text-center text-white
      "
    >
      <p className="text-xl font-semibold mb-2">
        Designed with real-world ride safety principles
      </p>
      <p className="text-white/70 max-w-3xl mx-auto">
        RideIT focuses on user awareness, ride transparency, and control —
        ensuring every journey feels safe, predictable, and reliable.
      </p>
    </div>

  </div>
</section>



{showBookingPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div
      className="bg-white/80 backdrop-blur-xl
      rounded-3xl shadow-2xl p-8 w-full max-w-md
      text-center relative animate-fadeIn"
    >
      {/* CLOSE BUTTON */}
      <button
        onClick={() => setShowBookingPopup(false)}
        className="absolute top-4 right-5 text-xl"
      >
        ✕
      </button>

      {/* ================= LOGIN REQUIRED ================= */}
      {popupType === "login" && (
        <>
          <h2 className="text-2xl font-bold mb-4">
            Login Required
          </h2>

          <p className="text-gray-700 mb-6">
            Please login or create an account to book a ride.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="bg-black text-white px-6 py-3 rounded-full"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="bg-white border px-6 py-3 rounded-full"
            >
              Sign Up
            </Link>
          </div>
        </>
      )}

    {/* ================= BOOKING POPUP CONTENT ================= */}

{popupType === "login" && (
  <>
    <h2 className="text-2xl font-bold mb-4">Login Required</h2>
    <p className="text-gray-700 mb-6">
      Please login or create an account to book a ride.
    </p>

    <div className="flex justify-center gap-4">
      <Link
        to="/login"
        className="bg-black text-white px-6 py-3 rounded-full"
      >
        Login
      </Link>
      <Link
        to="/register"
        className="bg-white border px-6 py-3 rounded-full"
      >
        Sign Up
      </Link>
    </div>
  </>
)}

{/* CASH PAYMENT */}
{popupType === "cash" && (
  <>
    <h2 className="text-2xl font-bold mb-4">Confirm Ride</h2>
    <p className="text-gray-700 mb-6">{finalMessage}</p>

    <button
      onClick={startBookingFlow}
      className="bg-black text-white px-6 py-3 rounded-full"
    >
      Confirm Booking
    </button>
  </>
)}

{popupType === "upi" && (
  <>
    <h2 className="text-2xl font-bold mb-2">Pay via UPI</h2>

    <p className="text-sm text-gray-600 mb-4">
      Amount: <span className="font-semibold text-black">₹{pendingPayload?.fare}</span>
    </p>

    <img
      src="/images/upi-qr.png"
      alt="UPI QR"
      className="mx-auto mb-6 w-48"
    />

    <p className="text-gray-700 mb-6">
      Scan the QR and complete payment
    </p>

    <button
      onClick={startBookingFlow}
      className="bg-black text-white px-6 py-3 rounded-full"
    >
      I’ve Paid
    </button>
  </>
)}

{/* UPI VERIFICATION TIMER */}
{popupType === "upiTimer" && (
  <>
    <h2 className="text-2xl font-bold mb-4">Verifying Payment</h2>
    <p className="text-gray-700">
      Please wait… {countdown}s
    </p>
  </>
)}

{/* CARD PAYMENT */}
{popupType === "card" && (
  <>
    <h2 className="text-2xl font-bold mb-4">Card Payment</h2>
    <p className="text-gray-700">Coming soon 🚧</p>
  </>
)}

{/* BOOKING PROGRESS */}
{/* ================= BOOKING FLOW POPUP ================= */}
{popupType === "booking" && (
  <>
    <h2 className="text-2xl font-bold mb-4">
      Booking Your Ride
    </h2>

    <p className="text-gray-700 mb-6">
      {bookingStage === "searching" && "Searching for a driver..."}
      {bookingStage === "confirming" && "Confirming your ride..."}
      {bookingStage === "booked" && "Ride booked successfully 🚕"}
    </p>

    {bookingStage !== "booked" && (
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-6">
        <div
          className="bg-black h-3 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    )}

    {bookingStage === "booked" && (
      <button
        onClick={() => {
          setShowBookingPopup(false);
          document
            .getElementById("my-rides-section")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
        className="bg-black text-white px-6 py-3 rounded-full
        hover:scale-105 transition"
      >
        See My Rides
      </button>
    )}
  </>
)}


    </div>
  </div>
)}


{/* ================= FOOTER ================= */}
<footer className="relative bg-black text-white overflow-hidden">

  {/* GRADIENT OVERLAY */}
  <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>

  {/* CONTENT */}
  <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">

    {/* TOP GRID */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

      {/* BRAND */}
      <div>
        <h3 className="text-3xl font-extrabold mb-4">RideIT</h3>
        <p className="text-white/70 leading-relaxed">
          A modern ride booking platform for fast, reliable and
          affordable travel — cabs, bikes and rentals.
        </p>
      </div>

      {/* QUICK LINKS */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
        <ul className="space-y-3 text-white/70">
          <li className="hover:text-white transition">Home</li>
          <li className="hover:text-white transition">Book Ride</li>
          <li className="hover:text-white transition">My Rides</li>
          <li className="hover:text-white transition">Support</li>
        </ul>
      </div>

      {/* SERVICES */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Services</h4>
        <ul className="space-y-3 text-white/70">
          <li>🚕 Cab Booking</li>
          <li>🏍 Bike Rides</li>
          <li>⏱ Rentals</li>
          <li>📍 City Travel</li>
        </ul>
      </div>

      {/* CONTACT */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Contact</h4>
        <ul className="space-y-3 text-white/70">
          <li>Email: support@rideit.com</li>
          <li>Phone: +91 9XXXXXXXXX</li>
          <li>Location: India</li>
        </ul>
      </div>

    </div>

    {/* DIVIDER */}
    <div className="border-t border-white/10 mb-8"></div>

    {/* BOTTOM BAR */}
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">

      <p>
        © {new Date().getFullYear()} RideIT. All rights reserved.
      </p>

      <div className="flex gap-6">
        <span className="hover:text-white transition cursor-pointer">
          Privacy Policy
        </span>
        <span className="hover:text-white transition cursor-pointer">
          Terms of Service
        </span>
      </div>

    </div>

  </div>
</footer>

    </div>
  );
}

export default Home;
