import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../../api/axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // ==========================================
  // LOAD REMEMBERED EMAIL
  // ==========================================

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberEmail");

    if (rememberedEmail) {
      setFormData({
        email: rememberedEmail,
        password: "",
        rememberMe: true,
      });
    }
  }, []);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/login", {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {

        // ==========================================
        // REMEMBER EMAIL
        // ==========================================

        if (formData.rememberMe) {
          localStorage.setItem(
            "rememberEmail",
            formData.email
          );
        } else {
          localStorage.removeItem("rememberEmail");
        }

        // ==========================================
        // STORE LOGGED-IN USER
        // ==========================================

        const loggedInUser = {
          id: response.data.user_id,
          name: response.data.name,
          email: formData.email,
        };

        localStorage.setItem(
          "user",
          JSON.stringify(loggedInUser)
        );

        // ==========================================
        // SUCCESS MESSAGE
        // ==========================================

        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 2000,
        });

        // ==========================================
        // GO TO CHOOSE MODE
        // ==========================================

        navigate("/choose-mode");

      } else {

        toast.error(
          response.data.message || "Login failed",
          {
            position: "top-right",
            autoClose: 3000,
          }
        );

      }

    } catch (error) {

      if (error.response) {

        toast.error(
          error.response.data.message ||
            "Invalid email or password",
          {
            position: "top-right",
            autoClose: 3000,
          }
        );

      } else {

        toast.error(
          "Unable to connect to server. Please try again.",
          {
            position: "top-right",
            autoClose: 3000,
          }
        );

      }
    }
  };

  // ==========================================
  // INPUT STYLE
  // ==========================================

  const inputStyle =
    "w-full rounded-lg border border-slate-300 px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        {/* ==========================================
            LOGO
        ========================================== */}

        <div className="text-center mb-8">

          <div className="inline-flex items-center gap-3">

            <div className="w-16 h-16 rounded-xl bg-blue-600 text-white flex items-center justify-center text-4xl font-bold shadow-md">
              V
            </div>

            <div className="text-left">

              <h1 className="text-5xl font-bold tracking-tight">

                <span className="text-slate-800">
                  Vita
                </span>

                <span className="text-blue-600">
                  Sense
                </span>

              </h1>

              <p className="text-sm text-slate-500">
                AI Powered Digital Fatigue Detection
              </p>

            </div>

          </div>

        </div>


        {/* ==========================================
            LOGIN CARD
        ========================================== */}

        <div className="bg-white rounded-xl shadow-md p-8">

          <h2 className="text-3xl font-bold text-slate-800 text-center">
            Welcome Back
          </h2>

          <p className="text-center text-slate-500 mt-2 mb-8">
            Sign in to continue
          </p>


          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* ==========================================
                EMAIL
            ========================================== */}

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


            {/* ==========================================
                PASSWORD
            ========================================== */}

            <div>

              <label className="text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`${inputStyle} pr-12`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600"
                >

                  {showPassword ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}

                </button>

              </div>

            </div>


            {/* ==========================================
                REMEMBER ME / FORGOT PASSWORD
            ========================================== */}

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


            {/* ==========================================
                LOGIN BUTTON
            ========================================== */}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition"
            >
              Login
            </button>

          </form>

        </div>


        {/* ==========================================
            REGISTER
        ========================================== */}

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