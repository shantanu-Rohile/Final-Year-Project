import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/signin", formData);
      if (response.status === 200 || response.status === 201) {
        alert("Signup Successful!");
        navigate("/landingpage");
      }
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] text-gray-100">
      <div className="bg-[#1a1a2e] p-10 rounded-2xl shadow-[0_0_25px_#8b5cf650] w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-purple-500 mb-6">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="text"
            name="name"
            placeholder="Username"
            onChange={handleChange}
            className="p-3 rounded-lg bg-[#141427] border border-gray-700 text-gray-100 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="p-3 rounded-lg bg-[#141427] border border-gray-700 text-gray-100 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="p-3 rounded-lg bg-[#141427] border border-gray-700 text-gray-100 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition"
            required
          />

          <button
            type="submit"
            className="py-3 rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold text-white shadow-[0_0_15px_#8b5cf6] hover:shadow-[0_0_25px_#a78bfa] transition"
          >
            Create Account
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-gray-300 font-medium">{message}</p>
        )}

        <p className="text-sm text-gray-400 text-center mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
