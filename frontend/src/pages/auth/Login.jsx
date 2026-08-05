import { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    // axios.post("/login", formData);
  };

  const inputStyle =
    "w-full rounded-lg border border-slate-300 px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        {/* Logo */}

        <div className="text-center mb-8">

          <div className="inline-flex items-center gap-3">

            <div className="w-18 h-18 rounded-xl bg-blue-600 text-white flex items-center justify-center text-6xl font-bold shadow-md">
              M
            </div>

            <div className="text-left">

              <h1 className="text-5xl font-bold tracking-tight">
                <span className="text-slate-800">Mind</span>
                <span className="text-blue-600">Pulse</span>
              </h1>

              <p className="text-sm text-slate-500">
                AI Powered Digital Fatigue Detection
              </p>

            </div>

          </div>

        </div>

        {/* Login Card */}

        <div className="bg-white rounded-xl shadow-md p-8">

          <h2 className="text-4xl font-bold text-slate-800 text-center">
            Welcome Back
          </h2>

          <p className="text-center text-slate-500 mt-2 mb-8">
            Sign in to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}

            <div>

              <label className="text-sm font-medium text-slate-700">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                className={inputStyle}
              />

            </div>

            {/* Password */}

            <div>

              <label className="text-sm font-medium text-slate-700">
                Password
              </label>

              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={inputStyle}
              />

            </div>

            {/* Remember Me & Forgot Password */}

            <div className="flex items-center justify-between">

              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">

                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="rounded text-blue-600"
                />

                Remember me

              </label>

              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                Forgot Password?
              </Link>

            </div>

            {/* Login Button */}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition"
            >
              Login
            </button>

          </form>

        </div>

        {/* Register */}

        <p className="text-center mt-6 text-slate-600">

          Don't have an account?

          <Link
            to="/register"
            className="ml-2 text-blue-600 font-semibold hover:underline"
          >
            Create Account
          </Link>

        </p>

      </div>

    </div>
  );
};

export default Login;