import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-950">

      {/* Sidebar */}
      <Sidebar />

      {/* Right Section */}
      <div className="flex-1 ml-[260px] flex flex-col">

        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-slate-950">

          {children}

        </main>

      </div>

    </div>
  );
};

export default MainLayout;