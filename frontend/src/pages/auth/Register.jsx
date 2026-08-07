import React, { useState } from "react";
import {
  BrainCircuit,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Briefcase,
} from "lucide-react";
import { Link } from "react-router-dom";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    role: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    console.log(formData);
    // Backend integration later
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100 px-4">

<div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-center mt-6 text-gray-800">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Join AI Digital Fatigue & Burnout Detection System
        </p>

        <form onSubmit={handleRegister} className="mt-6 space-y-4">

          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-600 focus:outline-none"
            />
          </div>

          {/* Age */}
          <div className="relative">
            <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="number"
              name="age"
              placeholder="Age"
              min="15"
              max="100"
              value={formData.age}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-600 focus:outline-none"
            />
          </div>

          {/* Role */}
          <div className="relative">
            <Briefcase className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:border-blue-600 focus:outline-none"
            >
              <option value="">Select Your Role</option>
              <option value="Student">Student</option>
              <option value="Employee">Employee</option>
              <option value="Researcher">Researcher</option>
              <option value="Teacher">Teacher</option>
              <option value="Healthcare Professional">
                Healthcare Professional
              </option>
              <option value="Manager">Manager</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-gray-500"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />

            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:outline-none"
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:scale-105 transition flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Create Account
          </button>

        </form>

        {/* Login Link */}
        <p className="text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>

      </div>

    </div>
  );
};

export default Register;