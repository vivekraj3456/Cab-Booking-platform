import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== AUTH =====
export const registerUser = (userData) =>
  api.post("/users/register", userData);

export const loginUser = (userData) =>
  api.post("/users/login", userData);

// ===== RIDES =====
export const createRide = (rideData) =>
  api.post("/rides", rideData);

export const getMyRides = () =>
  api.get("/rides/my");

export const updateRideStatus = (rideId, status) =>
  api.put(`/rides/${rideId}/status`, { status });

export default api;
