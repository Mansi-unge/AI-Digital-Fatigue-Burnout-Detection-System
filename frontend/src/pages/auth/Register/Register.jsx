import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import api from "../../../api/axios";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_number: "",
    date_of_birth: "",
    address: "",
    designation: "Student",
    password: "",
    confirmPassword: "",
  });

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset OTP verification if email changes
    if (name === "email") {
      setOtp("");
      setOtpSent(false);
      setEmailVerified(false);
    }
  };

  // ==========================================
  // SEND OTP
  // ==========================================

  const sendOtp = async () => {
    if (!formData.email) {
      toast.warning("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      toast.warning("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/send-otp", {
        email: formData.email,
      });

      if (response.data.success) {
        toast.success(
          response.data.message || "OTP sent successfully! 📧"
        );

        setOtpSent(true);
      } else {
        toast.error(
          response.data.message || "Unable to send OTP."
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const verifyOtp = async () => {
    if (!otp) {
      toast.warning("Please enter the OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/verify-otp", {
        email: formData.email,
        otp: otp,
      });

      if (response.data.success) {
        toast.success(
          response.data.message || "Email verified successfully! ✅"
        );

        setEmailVerified(true);
      } else {
        toast.error(
          response.data.message || "Invalid OTP."
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // NEXT STEP
  // ==========================================

  const nextStep = () => {
    // Required fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.mobile_number ||
      !formData.date_of_birth
    ) {
      toast.warning("Please fill all required fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      toast.warning("Please enter a valid email address.");
      return;
    }

    // Mobile validation
    const mobileRegex = /^[0-9]{10}$/;

    if (!mobileRegex.test(formData.mobile_number)) {
      toast.warning(
        "Mobile number must contain exactly 10 digits."
      );
      return;
    }

    // Email verification
    if (!emailVerified) {
      toast.warning("Please verify your email first. 📧");
      return;
    }

    toast.success("Personal information completed! Continue to account setup. ➡️");

    setStep(2);
  };

  // ==========================================
  // PREVIOUS STEP
  // ==========================================

  const prevStep = () => {
    setStep(1);
  };

  // ==========================================
  // REGISTER USER
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.mobile_number ||
      !formData.date_of_birth ||
      !formData.address ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.warning("Please fill all required fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      toast.warning("Please enter a valid email address.");
      return;
    }

    // Mobile validation
    const mobileRegex = /^[0-9]{10}$/;

    if (!mobileRegex.test(formData.mobile_number)) {
      toast.warning(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;

    if (!passwordRegex.test(formData.password)) {
      toast.warning(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    // Password match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    // Email verification
    if (!emailVerified) {
      toast.warning("Please verify your email first. 📧");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/register", {
        name: formData.name,
        email: formData.email,
        mobile_number: formData.mobile_number,
        date_of_birth: formData.date_of_birth,
        address: formData.address,
        designation: formData.designation,
        password: formData.password,
      });

      if (response.data.success) {
        toast.success(
          response.data.message ||
            "Registration successful! 🎉"
        );

        // Reset OTP state
        setOtp("");
        setOtpSent(false);
        setEmailVerified(false);

        // Navigate to login
        navigate("/login");
      } else {
        toast.error(
          response.data.message ||
            "Registration failed."
        );
      }
    } catch (error) {
      if (error.response) {
        toast.error(
          error.response.data.message ||
            "Registration failed."
        );
      } else {
        toast.error(
          "Unable to connect to server. Please try again. 🌐"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-100 flex items-center justify-center px-6">

      <div className="w-full max-w-4xl">

        {/* ==========================================
            HEADING
        ========================================== */}

        <div className="text-center mb-6">

          <div className="text-center mb-4">

            <div className="inline-flex items-center gap-3">

              <div className="w-18 h-18 rounded-xl bg-blue-600 text-white flex items-center justify-center text-6xl font-bold shadow-md">
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

          <p className="text-slate-500">
            Create your account
          </p>

        </div>

        {/* ==========================================
            STEP INDICATOR
        ========================================== */}

        <div className="flex justify-center mb-6">

          <div className="flex items-center gap-4">

            <div
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                step === 1
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-slate-600"
              }`}
            >
              Personal Information
            </div>

            <div className="w-12 h-[2px] bg-gray-300"></div>

            <div
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                step === 2
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-slate-600"
              }`}
            >
              Account Setup
            </div>

          </div>

        </div>

        {/* ==========================================
            FORM
        ========================================== */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-6"
        >

          {/* STEP ONE */}

          {step === 1 && (
            <StepOne
              formData={formData}
              handleChange={handleChange}
              nextStep={nextStep}

              otp={otp}
              setOtp={setOtp}

              otpSent={otpSent}
              emailVerified={emailVerified}

              sendOtp={sendOtp}
              verifyOtp={verifyOtp}

              loading={loading}
            />
          )}

          {/* STEP TWO */}

          {step === 2 && (
            <StepTwo
              formData={formData}
              handleChange={handleChange}
              prevStep={prevStep}
            />
          )}

        </form>

        {/* ==========================================
            LOGIN LINK
        ========================================== */}

        <div className="text-center mt-4">

          <p className="text-slate-600">

            Already have an account?

            <Link
              to="/login"
              className="ml-2 text-blue-600 font-semibold hover:underline"
            >
              Login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
};

export default Register;