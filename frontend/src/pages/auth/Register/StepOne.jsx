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

        <div className="md:col-span-2">

          <label className="text-sm font-medium text-slate-700">
            Email Address
          </label>

          <div className="flex gap-2 mt-1">

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

            <button
              type="button"
              onClick={sendOtp}
              disabled={
                loading ||
                emailVerified ||
                !formData.email
              }
              className={`px-5 rounded-lg text-white transition ${
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

        {/* OTP */}

        {otpSent && !emailVerified && (

          <div className="md:col-span-2">

            <label className="text-sm font-medium text-slate-700">
              Enter OTP
            </label>

            <div className="flex gap-2 mt-1">

              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className={`${inputStyle} mt-0`}
              />

              <button
                type="button"
                onClick={verifyOtp}
                disabled={loading || otp.length !== 6}
                className={`px-5 rounded-lg text-white transition ${
                  loading || otp.length !== 6
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>

            </div>

          </div>

        )}

        {/* Success Message */}

        {emailVerified && (

          <div className="md:col-span-2">

            <p className="text-green-600 font-semibold">
              ✓ Email verified successfully.
            </p>

          </div>

        )}

        {/* Mobile */}

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
          disabled={!emailVerified}
          className={`px-8 py-2.5 rounded-lg font-medium transition ${
            emailVerified
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Next →
        </button>

      </div>

    </>
  );
};

export default StepOne;