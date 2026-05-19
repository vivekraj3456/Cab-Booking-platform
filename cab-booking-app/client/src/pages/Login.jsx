import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone || !formData.password) {
      setMessage("Please enter phone number and password");
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser(formData);

      login(res.data.user, res.data.token);
      setMessage("Login successful");

      // Redirect to home
      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div
  className="min-h-screen flex items-center justify-center px-6
  bg-cover bg-center relative"
  style={{ backgroundImage: "url('/images/ride-hero.jpg')" }}
>
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/40"></div>

      {/* LOGIN CARD */}
      <div
        className="w-full max-w-md
        bg-white/70 backdrop-blur-xl
        rounded-3xl shadow-2xl p-10
        transition-all duration-300 hover:scale-[1.02]"
      >
        {/* LOGO / TITLE */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-2">RideIT</h1>
          <p className="text-gray-600">
            Login to book and track your rides
          </p>
        </div>

        {/* MESSAGE */}
        {message && (
          <p
            className={`text-center mb-4 font-medium ${
              message === "Login successful"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* PHONE */}
          <input
            name="phone"
            type="text"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl
            bg-white/80 shadow
            focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {/* PASSWORD */}
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl
            bg-white/80 shadow
            focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white
            py-3 rounded-full font-semibold
            transition-all duration-300
            hover:bg-gray-900 hover:shadow-xl
            disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* FOOTER LINKS */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-black hover:underline"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
