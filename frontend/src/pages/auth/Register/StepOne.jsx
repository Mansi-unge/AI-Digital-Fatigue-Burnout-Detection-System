const StepOne = ({
  formData,
  handleChange,
  nextStep,
  otp,
  setOtp,
  otpSent,
  emailVerified,
  sendOtp,
  verifyOtp,
  loading,
}) => {
  const inputStyle =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm md:text-base mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  // ==========================================
  // HANDLE OTP INPUT
  // ==========================================

  const handleOtpChange = (e) => {
    const value = e.target.value;

    // Allow only numbers
    if (/^\d*$/.test(value)) {
      setOtp(value);
    }
  };

  return (
    <div className="w-full">

      {/* ==========================================
          FORM GRID
      ========================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">

        {/* ==========================================
            FULL NAME
        ========================================== */}

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

        {/* ==========================================
            EMAIL
        ========================================== */}

        <div className="md:col-span-2">

          <label className="text-sm font-medium text-slate-700">
            Email Address
          </label>

          <div className="flex flex-col sm:flex-row gap-2 mt-1">

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              disabled={emailVerified}
              className={`${inputStyle} mt-0 ${
                emailVerified
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
            />

            {/* SEND OTP */}

            <button
              type="button"
              onClick={sendOtp}
              disabled={
                loading ||
                emailVerified ||
                !formData.email
              }
              className={`px-4 md:px-5 py-2 rounded-lg text-sm md:text-base text-white transition whitespace-nowrap ${
                loading ||
                emailVerified ||
                !formData.email
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading
                ? "Sending..."
                : otpSent
                ? "Resend"
                : "Send OTP"}
            </button>

          </div>

        </div>

        {/* ==========================================
            OTP
        ========================================== */}

        {otpSent && !emailVerified && (

          <div className="md:col-span-2">

            <label className="text-sm font-medium text-slate-700">
              Enter OTP
            </label>

            <div className="flex flex-col sm:flex-row gap-2 mt-1">

              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className={`${inputStyle} mt-0`}
              />

              {/* VERIFY OTP */}

              <button
                type="button"
                onClick={verifyOtp}
                disabled={
                  loading ||
                  otp.length !== 6
                }
                className={`px-4 md:px-5 py-2 rounded-lg text-sm md:text-base text-white transition whitespace-nowrap ${
                  loading ||
                  otp.length !== 6
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading
                  ? "Verifying..."
                  : "Verify"}
              </button>

            </div>

          </div>

        )}

        {/* ==========================================
            EMAIL VERIFIED
        ========================================== */}

        {emailVerified && (

          <div className="md:col-span-2">

            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">

              <span className="text-green-600 text-base md:text-lg">
                ✓
              </span>

              <p className="text-green-700 text-sm md:text-base font-semibold">
                Email verified successfully.
              </p>

            </div>

          </div>

        )}

        {/* ==========================================
            MOBILE NUMBER
        ========================================== */}

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
            maxLength={10}
            inputMode="numeric"
            className={inputStyle}
          />

        </div>

        {/* ==========================================
            DATE OF BIRTH
        ========================================== */}

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

      {/* ==========================================
          NEXT BUTTON
      ========================================== */}

      <div className="flex justify-end mt-6 md:mt-8">

        <button
          type="button"
          onClick={nextStep}
          disabled={!emailVerified}
          className={`px-6 md:px-8 py-2 md:py-2.5 rounded-lg font-medium text-sm md:text-base transition ${
            emailVerified
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Next →
        </button>

      </div>

    </div>
  );
};

export default StepOne;