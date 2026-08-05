import { useState } from "react";
import { Link } from "react-router-dom";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import api from "../../../api/axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

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

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const nextStep = () => {
  if (
    !formData.name ||
    !formData.email ||
    !formData.mobile_number ||
    !formData.date_of_birth
  ) {
    alert("Please fill all required fields.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(formData.email)) {
    alert("Please enter a valid email.");
    return;
  }

  const mobileRegex = /^[0-9]{10}$/;

  if (!mobileRegex.test(formData.mobile_number)) {
    alert("Mobile number must contain exactly 10 digits.");
    return;
  }

  setStep(2);
};

  const prevStep = () => {
    setStep(1);
  };

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
      alert("Please fill all required fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Mobile validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/;

    if (!mobileRegex.test(formData.mobile_number)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;

    if (!passwordRegex.test(formData.password)) {
      alert(
        "Password must contain:\n\n" +
        "• At least 8 characters\n" +
        "• One uppercase letter\n" +
        "• One lowercase letter\n" +
        "• One number\n" +
        "• One special character"
      );
      return;
    }

    // Password match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
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
        alert(response.data.message);
        navigate("/login");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Unable to connect to server.");
      }
    }
  };

  return (
    <div className="h-screen bg-slate-100 flex items-center justify-center px-6">

      <div className="w-full max-w-4xl">

        {/* Heading */}

        <div className="text-center mb-6">

          <div className="text-center mb-4">

            <div className="inline-flex items-center gap-3">

              <div className="w-18 h-18 rounded-xl bg-blue-600 text-white flex items-center justify-center text-6xl font-bold shadow-md">
                V
              </div>

              <div className="text-left">

                <h1 className="text-5xl font-bold tracking-tight">
                  <span className="text-slate-800">Vita</span>
                  <span className="text-blue-600">Sense</span>
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

        {/* Step Indicator */}

        <div className="flex justify-center mb-6">

          <div className="flex items-center gap-4">

            <div
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${step === 1
                ? "bg-blue-600 text-white"
                : "bg-white border text-slate-600"
                }`}
            >
              Personal Information
            </div>

            <div className="w-12 h-[2px] bg-gray-300"></div>

            <div
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${step === 2
                ? "bg-blue-600 text-white"
                : "bg-white border text-slate-600"
                }`}
            >
              Account Setup
            </div>

          </div>

        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-6"
        >

          {step === 1 && (
            <StepOne
              formData={formData}
              handleChange={handleChange}
              nextStep={nextStep}
            />
          )}

          {step === 2 && (
            <StepTwo
              formData={formData}
              handleChange={handleChange}
              prevStep={prevStep}
            />
          )}

        </form>

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