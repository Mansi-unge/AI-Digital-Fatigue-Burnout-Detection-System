import React, { useState } from "react";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileMenu = ({ user }) => {
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);

  // ==========================================================
  // DISPLAY VALUES
  // ==========================================================

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "No email available";

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    localStorage.removeItem("name");
    localStorage.removeItem("token");
    localStorage.removeItem("selectedMode");

    setShowProfile(false);

    navigate("/login", { replace: true });
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="relative">

      {/* ======================================================
          PROFILE BUTTON
      ====================================================== */}

      <button
        type="button"
        onClick={() => setShowProfile((prev) => !prev)}
        className="
          flex
          items-center
          gap-3
          px-2
          py-1.5
          rounded-xl
          hover:bg-slate-50
          transition
          duration-200
          focus:outline-none
        "
      >

        {/* ==================================================
            AVATAR
        ================================================== */}

        <div className="
          w-10
          h-10
          rounded-full
          bg-blue-600
          flex
          items-center
          justify-center
          shadow-sm
        ">

          <FaUserCircle
            className="text-white"
            size={32}
          />

        </div>

      </button>

      {/* ======================================================
          PROFILE DROPDOWN
      ====================================================== */}

      {showProfile && (

        <div className="
          absolute
          right-0
          top-14
          w-72
          bg-white
          border
          border-slate-200
          rounded-2xl
          shadow-xl
          z-[100]
          overflow-hidden
        ">

          {/* ==================================================
              PROFILE HEADER
          ================================================== */}

          <div className="
            px-5
            py-5
            bg-slate-50
            border-b
            border-slate-100
          ">

            <div className="flex items-center gap-3">

              {/* AVATAR */}

              <div className="
                w-12
                h-12
                rounded-full
                bg-blue-600
                flex
                items-center
                justify-center
                shadow-sm
                shrink-0
              ">

                <FaUserCircle
                  className="text-white"
                  size={36}
                />

              </div>

              {/* USER INFORMATION */}

              <div className="min-w-0">

                <p className="
                  text-base
                  font-semibold
                  text-slate-800
                  truncate
                ">
                  {displayName}
                </p>

                <p className="
                  text-sm
                  text-slate-500
                  truncate
                  mt-0.5
                ">
                  {displayEmail}
                </p>

              </div>

            </div>

          </div>

          {/* ==================================================
              ACCOUNT INFORMATION
          ================================================== */}

          <div className="px-5 py-4">

            <p className="
              text-[11px]
              font-semibold
              uppercase
              tracking-wider
              text-slate-400
              mb-3
            ">
              Account
            </p>

            {/* USER ID */}
            {/* USER ID */}
            <div
              className="
    flex
    items-center
    justify-between
    bg-slate-50
    border
    border-slate-100
    rounded-lg
    px-3
    py-2.5
  "
            >
              <div className="flex items-center gap-2">
                <User
                  size={14}
                  className="text-slate-400"
                />

                <span className="text-xs text-slate-400">
                  Account ID
                </span>
              </div>

              <span
                className="
      text-sm
      font-semibold
      text-slate-700
    "
              >
                {user?.accountId || "USR-0000"}
              </span>
            </div>

            {/* EMAIL */}

            <div className="
              flex
              items-center
              justify-between
              gap-3
              bg-slate-50
              border
              border-slate-100
              rounded-lg
              px-3
              py-2.5
              mt-2
            ">

              <span className="
                text-xs
                text-slate-400
                shrink-0
              ">
                Email
              </span>

              <span className="
                text-sm
                font-semibold
                text-slate-700
                max-w-[170px]
                truncate
              ">
                {displayEmail}
              </span>

            </div>

            {/* ==================================================
                LOGOUT
            ================================================== */}

            <div className="
              border-t
              border-slate-100
              mt-4
              pt-3
            ">

              <button
                type="button"
                onClick={handleLogout}
                className="
                  w-full
                  flex
                  items-center
                  gap-3
                  px-3
                  py-2.5
                  rounded-lg
                  text-slate-600
                  hover:bg-red-50
                  hover:text-red-600
                  transition
                  duration-200
                "
              >

                <FaSignOutAlt size={15} />

                <span className="text-sm font-medium">
                  Logout
                </span>

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default ProfileMenu;