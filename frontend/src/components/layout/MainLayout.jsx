import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout = ({ children }) => {
  const location = useLocation();

  // Hide global header on pages that have their own layout
  const hideHeader =
    location.pathname === "/notifications" ||
    location.pathname === "/profile";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar />

      {/* ======================================================
          RIGHT APPLICATION AREA
      ====================================================== */}

      <div
        className="
          flex
          min-w-0
          flex-1
          flex-col
          ml-[260px]
        "
      >

        {/* ====================================================
            GLOBAL HEADER

            Hidden on:
            - Notifications
            - Profile
        ==================================================== */}

        {!hideHeader && <Header />}

        {/* ====================================================
            PAGE CONTENT
        ==================================================== */}

        <main
          className="
            min-h-0
            flex-1
            overflow-auto
            bg-slate-50
          "
        >
          {children}
        </main>

      </div>

    </div>
  );
};

export default MainLayout;