import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
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

    if (!formData.name || !formData.phone || !formData.password) {
      setMessage("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await registerUser(formData);
      setMessage("Registration successful");

      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Registration failed"
      );
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

      {/* REGISTER CARD */}
      <div
        className="w-full max-w-md
        bg-white/70 backdrop-blur-xl
        rounded-3xl shadow-2xl p-10
        transition-all duration-300 hover:scale-[1.02]"
      >
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-2">
            RideIT
          </h1>
          <p className="text-gray-600">
            Create your account to start booking rides
          </p>
        </div>

        {/* MESSAGE */}
        {message && (
          <p
            className={`text-center mb-4 font-medium ${
              message === "Registration successful"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* NAME */}
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl
            bg-white/80 shadow
            focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {/* EMAIL */}
          <input
            name="email"
            type="email"
            placeholder="Email (optional)"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl
            bg-white/80 shadow
            focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

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
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* FOOTER */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-black hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
