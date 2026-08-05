const StepOne = ({ formData, handleChange, nextStep }) => {
  const inputStyle =
    "w-full rounded-lg border border-slate-300 px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Full Name */}

        <div>
          <label className="text-sm font-medium text-slate-700">
            Full Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={inputStyle}
          />
        </div>

        {/* Email */}

        <div>
          <label className="text-sm font-medium text-slate-700">
            Email Address
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@gmail.com"
            className={inputStyle}
          />
        </div>

        {/* Mobile Number */}

        <div>
          <label className="text-sm font-medium text-slate-700">
            Mobile Number
          </label>

          <input
            type="text"
            name="mobile_number"
            value={formData.mobile_number}
            onChange={handleChange}
            placeholder="9876543210"
            className={inputStyle}
          />
        </div>

        {/* Date of Birth */}

        <div>
          <label className="text-sm font-medium text-slate-700">
            Date of Birth
          </label>

          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

      </div>

      {/* Next Button */}

      <div className="flex justify-end mt-10">
        <button
          type="button"
          onClick={nextStep}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium transition"
        >
          Next →
        </button>
      </div>
    </>
  );
};

export default StepOne;