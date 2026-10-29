import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "../../components/common/ProfileMenu";
import {
  FaChartLine,
  FaBrain,
  FaUserCircle,
  FaLock,
  FaArrowRight,
  FaSignOutAlt,
} from "react-icons/fa";
import api from "../../api/axios"
const ChooseMode = () => {
  const navigate = useNavigate();

  // ==========================================
  // USER STATE
  // ==========================================

  const [user, setUser] = useState({
    id: null,
    name: "",
    email: "",
  });

  // ==========================================
  // LOAD LOGGED-IN USER
  // ==========================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      // User is not logged in
      navigate("/login", { replace: true });
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      setUser({
        id: parsedUser.id ?? null,
        name: parsedUser.name ?? "",
        email: parsedUser.email ?? "",
      });
    } catch (error) {
      console.error("Invalid user data in localStorage");

      localStorage.removeItem("user");
      localStorage.removeItem("user_id");
      localStorage.removeItem("name");

      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ==========================================
  // DATA COLLECTION MODE
  // ==========================================
  const handleDataCollection = async () => {
    if (!user.id) {
      console.error("User ID is not available");
      navigate("/login", { replace: true });
      return;
    }

    try {
      const response = await api.post("/monitoring/start", {
        user_id: user.id,
        mode: "DATA_COLLECTION",
      });

      console.log("Data Collection monitoring started:", response.data);

      localStorage.setItem("selectedMode", "DATA_COLLECTION");

      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Failed to start Data Collection monitoring:",
        error.response?.data || error.message
      );
    }
  };


  // ==========================================
  // AI FATIGUE DETECTION MODE
  // ==========================================
  const handleAIMonitoring = async () => {
    if (!user.id) {
      console.error("User ID is not available");
      navigate("/login", { replace: true });
      return;
    }

    try {
      const response = await api.post("/monitoring/start", {
        user_id: user.id,
        mode: "AI_MONITORING",
      });

      console.log("AI Monitoring started:", response.data);

      localStorage.setItem("selectedMode", "AI_MONITORING");


      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Failed to start AI monitoring:",
        error.response?.data || error.message
      );
    }
  };

  // ==========================================
  // DISPLAY VALUES
  // ==========================================

  const displayName = user?.name || "User";

  const displayEmail = user?.email || "No email available";

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="bg-white border-b border-slate-200 shadow-sm shrink-0">

        <div className="w-full px-6 lg:px-10 py-3 flex items-center justify-between">

          {/* =================================================
              LOGO
          ================================================= */}

          <div className="inline-flex items-center gap-3">

            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-blue-600 text-white flex items-center justify-center text-3xl lg:text-4xl font-bold shadow-md">
              V
            </div>

            <div className="text-left">

              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">

                <span className="text-slate-800">
                  Vita
                </span>

                <span className="text-blue-600">
                  Sense
                </span>

              </h1>

              <p className="text-[10px] lg:text-xs text-slate-500">
                AI Powered Digital Fatigue Detection
              </p>

            </div>

          </div>

          <ProfileMenu user={user} />

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="flex-1 flex items-center justify-center px-5 sm:px-8 lg:px-12 overflow-hidden">

        <div className="w-full max-w-5xl">

          {/* Title */}

          <div className="text-center mb-7 lg:mb-9">

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-3">
              What would you like to do today?
            </h2>

            <p className="text-sm lg:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
              Select an option below to get started. You can switch between
              modes anytime.
            </p>

          </div>

          {/* =================================================
              CARDS
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-7 max-w-4xl mx-auto">

            {/* =================================================
                DATA COLLECTION
            ================================================= */}

            <div
              className="
                bg-blue-50
                border border-blue-300
                rounded-2xl
                p-6 lg:p-7
                shadow-sm
                hover:shadow-lg
                transition duration-300
                flex flex-col
              "
            >

              <div
                className="
                  w-20 h-20
                  lg:w-24 lg:h-24
                  mx-auto
                  rounded-full
                  bg-blue-600
                  flex items-center justify-center
                  mb-5
                "
              >

                <FaChartLine
                  className="text-white"
                  size={42}
                />

              </div>

              <h3 className="text-xl lg:text-2xl font-bold text-slate-800 text-center mb-3">
                Data Collection
              </h3>

              <p className="text-sm lg:text-base text-slate-500 text-center leading-6 max-w-sm mx-auto mb-6">
                Help us improve VitaSense by collecting your data and
                sharing how you feel.
              </p>

              <button
                onClick={handleDataCollection}
                className="
                  mt-auto
                  w-full
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  font-semibold
                  py-3 px-5
                  rounded-lg
                  transition duration-200
                  flex items-center justify-center
                  gap-3
                  shadow-sm
                "
              >

                <span>
                  Start Data Collection
                </span>

                <FaArrowRight size={14} />

              </button>

            </div>

            {/* =================================================
                AI FATIGUE DETECTION
            ================================================= */}

            <div
              className="
                
                bg-emerald-50
                border border-emerald-300
                rounded-2xl
                p-6 lg:p-7
                shadow-sm
                hover:shadow-lg
                transition duration-300
                flex flex-col
              "
            >

              <div
                className="
                  w-20 h-20
                  lg:w-24 lg:h-24
                  mx-auto
                  rounded-full
                  bg-emerald-600
                  flex items-center justify-center
                  mb-5
                "
              >

                <FaBrain
                  className="text-white"
                  size={42}
                />

              </div>

              <h3 className="text-xl lg:text-2xl font-bold text-slate-800 text-center mb-3">
                AI Fatigue Detection
              </h3>

              <p className="text-sm lg:text-base text-slate-500 text-center leading-6 max-w-sm mx-auto mb-6">
                Get real-time fatigue insights powered by AI and receive
                personalized recommendations.
              </p>

              <button
                onClick={handleAIMonitoring}
                className="
                  mt-auto
                  w-full
                  bg-emerald-600
                  hover:bg-emerald-700
                  text-white
                  font-semibold
                  py-3 px-5
                  rounded-lg
                  transition duration-200
                  flex items-center justify-center
                  gap-3
                  shadow-sm
                "
              >

                <span>
                  Start AI Monitoring
                </span>

                <FaArrowRight size={14} />

              </button>

            </div>

          </div>

        </div>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white py-3 shrink-0">

        <div className="flex items-center justify-center gap-2 text-xs lg:text-sm text-slate-500 px-4">

          <FaLock
            className="text-slate-400 shrink-0"
            size={13}
          />

          <span className="text-center">
            Your data is secure and confidential. We value your privacy.
          </span>

        </div>

      </footer>

    </div>
  );
};

export default ChooseMode;