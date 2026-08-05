const StepTwo = ({ formData, handleChange, prevStep }) => {
  const inputStyle =
    "w-full rounded-lg border border-slate-300 px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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

        {/* Empty column for alignment */}

        <div></div>

        {/* Password */}

        <div>
          <label className="text-sm font-medium text-slate-700">
            Password
          </label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            className={inputStyle}
          />
        </div>

        {/* Confirm Password */}

        <div>
          <label className="text-sm font-medium text-slate-700">
            Confirm Password
          </label>

          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            className={inputStyle}
          />
        </div>

      </div>

      {/* Buttons */}

      <div className="flex justify-between items-center mt-8">

        <button
          type="button"
          onClick={prevStep}
          className="px-8 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
        >
          ← Back
        </button>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium transition"
        >
          Register
        </button>

      </div>
    </>
  );
};

export default StepTwo;