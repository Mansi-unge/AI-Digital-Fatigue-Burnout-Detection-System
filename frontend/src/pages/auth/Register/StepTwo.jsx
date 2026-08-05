import { useState } from "react";
import { FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const StepTwo = ({ formData, handleChange, prevStep }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputStyle =
    "w-full rounded-lg border border-slate-300 px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  // Password validation

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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Address */}

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-700">
            Address
          </label>

          <textarea
            rows="3"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your address"
            className={`${inputStyle} resize-none`}
          />
        </div>

        {/* Designation */}

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
            <option value="Student">Student</option>
            <option value="Employee">Employee</option>
          </select>
        </div>

        <div></div>

        {/* Password */}

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
              className={`${inputStyle} pr-12`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600"
            >
              {showPassword ? (
                <FaEyeSlash size={18} />
              ) : (
                <FaEye size={18} />
              )}
            </button>

          </div>

          {/* Password Validation */}

          {formData.password && (
            <div className="mt-3 space-y-1 text-sm">

              <p className="font-medium text-slate-700">
                Password must contain:
              </p>

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

        {/* Confirm Password */}

        <div>
          <label className="text-sm font-medium text-slate-700">
            Confirm Password
          </label>

          <div className="relative">

            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className={`${inputStyle} pr-12`}
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600"
            >
              {showConfirmPassword ? (
                <FaEyeSlash size={18} />
              ) : (
                <FaEye size={18} />
              )}
            </button>

          </div>

          {/* Password Match */}

          {formData.confirmPassword && (
            formData.password === formData.confirmPassword ? (
              <p className="text-green-600 text-sm mt-3 flex items-center gap-2">
                <FaCheckCircle />
                Passwords match
              </p>
            ) : (
              <p className="text-red-600 text-sm mt-3 flex items-center gap-2">
                <FaTimesCircle />
                Passwords do not match
              </p>
            )
          )}

        </div>

      </div>

      {/* Buttons */}

      <div className="flex justify-between items-center mt-10">

        <button
          type="button"
          onClick={prevStep}
          className="px-8 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
        >
          ← Back
        </button>

        <button
          type="submit"
          disabled={
            !passwordValid ||
            formData.password !== formData.confirmPassword
          }
          className={`px-8 py-2.5 rounded-lg font-medium transition ${
            passwordValid &&
            formData.password === formData.confirmPassword
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Register
        </button>

      </div>
    </>
  );
};

const ValidationItem = ({ valid, text }) => (
  <div
    className={`flex items-center gap-2 ${
      valid ? "text-green-600" : "text-red-500"
    }`}
  >
    {valid ? <FaCheckCircle /> : <FaTimesCircle />}
    <span>{text}</span>
  </div>
);

export default StepTwo;