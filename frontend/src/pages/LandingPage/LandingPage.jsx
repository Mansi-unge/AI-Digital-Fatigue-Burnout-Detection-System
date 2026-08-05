import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const loadingSteps = [
  "Initializing AI Engine...",
  "Loading Face Detection Module...",
  "Preparing Digital Fatigue Detection...",
  "Application Ready",
];

const LandingPage = () => {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev === loadingSteps.length - 1) {
          clearInterval(interval);
          setCompleted(true);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const progress = ((step + 1) / loadingSteps.length) * 100;

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-white to-blue-100 flex items-center justify-center">

      {/* Background Blobs */}

      <div className="absolute -top-32 -left-32 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl"></div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl"></div>

      {/* Main Content */}

      <div className="relative text-center w-full max-w-xl px-8">

        {/* Logo */}

        <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl animate-pulse">

          <span className="text-white text-5xl font-black">
            V
          </span>

        </div>

        {/* Title */}

        <h1 className="mt-8 text-6xl font-extrabold tracking-tight">

          <span className="text-slate-800">
            Vita
          </span>

          <span className="text-blue-600">
            Sense
          </span>

        </h1>

        <p className="mt-3 text-lg text-slate-600">
          AI Powered Digital Fatigue Detection System
        </p>

        {/* Loading */}

        {!completed ? (
          <>
            {/* Spinner */}

            <div className="flex justify-center mt-12">

              <div className="relative">

                <div className="w-14 h-14 rounded-full border-4 border-blue-100"></div>

                <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>

              </div>

            </div>

            {/* Loading Text */}

            <p className="mt-8 text-slate-700 text-lg font-medium transition-all duration-500">
              {loadingSteps[step]}
            </p>

            {/* Progress */}

            <div className="mt-8">

              <div className="flex justify-between text-sm text-slate-500 mb-2">

                <span>Loading</span>

                <span>{Math.round(progress)}%</span>

              </div>

              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                ></div>

              </div>

            </div>
          </>
        ) : (
          <div className="mt-12">

            <div className="text-green-800 text-xl font-semibold mb-8">
              ✓ Application Ready
            </div>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition duration-300"
            >
              Start Application
              <span>→</span>
            </Link>

          </div>
        )}

        {/* Footer */}

        <p className="mt-16 text-sm text-slate-500">
          © 2025 MindPulse • AI Digital Fatigue Detection
        </p>

      </div>

    </div>
  );
};

export default LandingPage;