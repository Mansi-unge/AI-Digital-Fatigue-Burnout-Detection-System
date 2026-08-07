import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";import { BrainCircuit } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
  const timer = setInterval(() => {
    setProgress((prev) => {
      if (prev >= 100) {
        clearInterval(timer);

        setTimeout(() => {
          navigate("/login");
        }, 500);

        return 100;
      }

      return prev + 1;
    });
  }, 35);

  return () => clearInterval(timer);
}, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100">

      <div className="w-[650px] rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl p-10 text-center border border-white">

        {/* Logo */}
        <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center animate-bounce shadow-xl">
          <BrainCircuit className="text-white w-12 h-12" />
        </div>

        {/* Title */}
        <h1 className="mt-8 text-4xl font-bold text-gray-800 leading-tight">
          AI Digital Fatigue
          <br />
          <span className="text-blue-600">
            & Burnout Detection System
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-gray-500">
          Smart Workplace Wellness Platform
        </p>

        {/* Loader */}
        <div className="mt-10 flex justify-center">
          <div className="w-14 h-14 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
        </div>

        {/* Loading */}
        <p className="mt-6 text-blue-700 font-semibold">
          Initializing AI...
        </p>

        {/* Progress */}
        <div className="mt-6 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="mt-3 text-gray-600 font-medium">
          {progress}% Complete
        </p>

        {/* Footer */}
        <p className="mt-8 text-xs text-gray-400">
          © 2026 AI Digital Fatigue & Burnout Detection System
        </p>

      </div>

    </div>
  );
};

export default Splash;