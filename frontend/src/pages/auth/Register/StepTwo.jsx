import { useState } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const StepTwo = ({
  formData,
  handleChange,
  prevStep,
  loading,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputStyle =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm md:text-base mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  // ==========================================
  // PASSWORD VALIDATION
  // ==========================================

  const validations = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[@$!%*?&.#]/.test(formData.password),
  };

  const passwordValid =
    validations.length &&
    validations.uppercase &&
    validations.lowercase &&
    validations.number &&
    validations.special;

  const passwordsMatch =
    formData.password === formData.confirmPassword;

  return (
    <div className="w-full">

      {/* ==========================================
          FORM GRID
      ========================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">

        {/* ==========================================
            ADDRESS
        ========================================== */}

        <div className="md:col-span-2">

          <label className="text-sm font-medium text-slate-700">
            Address
          </label>

          <textarea
            rows="2"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your address"
            className={`${inputStyle} resize-none`}
          />

        </div>

        {/* ==========================================
            DESIGNATION
        ========================================== */}

        <div>

          <label className="text-sm font-medium text-slate-700">
            Designation
          </label>

          <select
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            className={inputStyle}
          >
            <option value="Student">
              Student
            </option>

            <option value="Employee">
              Employee
            </option>
          </select>

        </div>

        {/* Empty column */}

        <div className="hidden md:block"></div>

        {/* ==========================================
            PASSWORD
        ========================================== */}

        <div>

          <label className="text-sm font-medium text-slate-700">
            Password
          </label>

          <div className="relative">

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              className={`${inputStyle} pr-11`}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600"
            >
              {showPassword ? (
                <FaEyeSlash size={17} />
              ) : (
                <FaEye size={17} />
              )}
            </button>

          </div>

          {/* ==========================================
              PASSWORD REQUIREMENTS
          ========================================== */}

          {formData.password && (

            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5 text-xs md:text-sm">

              <ValidationItem
                valid={validations.length}
                text="Minimum 8 characters"
              />

              <ValidationItem
                valid={validations.uppercase}
                text="One uppercase letter"
              />

              <ValidationItem
                valid={validations.lowercase}
                text="One lowercase letter"
              />

              <ValidationItem
                valid={validations.number}
                text="One number"
              />

              <ValidationItem
                valid={validations.special}
                text="One special character"
              />

            </div>

          )}

        </div>

        {/* ==========================================
            CONFIRM PASSWORD
        ========================================== */}

        <div>

          <label className="text-sm font-medium text-slate-700">
            Confirm Password
          </label>

          <div className="relative">

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className={`${inputStyle} pr-11`}
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600"
            >
              {showConfirmPassword ? (
                <FaEyeSlash size={17} />
              ) : (
                <FaEye size={17} />
              )}
            </button>

          </div>

          {/* ==========================================
              PASSWORD MATCH
          ========================================== */}

          {formData.confirmPassword && (

            passwordsMatch ? (

              <p className="text-green-600 text-xs md:text-sm mt-2 flex items-center gap-2">
                <FaCheckCircle />
                Passwords match
              </p>

            ) : (

              <p className="text-red-600 text-xs md:text-sm mt-2 flex items-center gap-2">
                <FaTimesCircle />
                Passwords do not match
              </p>

            )

          )}

        </div>

      </div>

      {/* ==========================================
          BUTTONS
      ========================================== */}

      <div className="flex justify-between items-center mt-2 md:mt-8">

        {/* BACK */}

        <button
          type="button"
          onClick={prevStep}
          disabled={loading}
          className="px-5 md:px-8 py-2 md:py-2.5 rounded-lg border border-slate-300 text-sm md:text-base hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Back
        </button>

        {/* REGISTER */}

        <button
          type="submit"
          disabled={
            loading ||
            !passwordValid ||
            !passwordsMatch
          }
          className={`px-5 md:px-8 py-2 md:py-2.5 rounded-lg font-medium text-sm md:text-base transition ${
            loading ||
            !passwordValid ||
            !passwordsMatch
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading
            ? "Registering..."
            : "Register"}
        </button>

      </div>

    </div>
  );
};

// ==========================================
// PASSWORD VALIDATION ITEM
// ==========================================

const ValidationItem = ({
  valid,
  text,
}) => (
  <div
    className={`flex items-center gap-1.5 ${
      valid
        ? "text-green-600"
        : "text-red-500"
    }`}
  >

    {valid ? (
      <FaCheckCircle className="flex-shrink-0" />
    ) : (
      <FaTimesCircle className="flex-shrink-0" />
    )}

    <span>{text}</span>

  </div>
);

export default StepTwo;