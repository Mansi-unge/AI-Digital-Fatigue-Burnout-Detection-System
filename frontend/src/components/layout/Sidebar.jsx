import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Thermometer,
  BrainCircuit,
  FileText,
  Lightbulb,
  History,
  Settings,
  User,
} from "lucide-react";

const Sidebar = () => {
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Activity",
      path: "/activity",
      icon: Activity,
    },
    {
      name: "Environment",
      path: "/environment",
      icon: Thermometer,
    },
    {
      name: "Fatigue Prediction",
      path: "/fatigue-prediction",
      icon: BrainCircuit,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: FileText,
    },
    {
      name: "Recommendations",
      path: "/recommendations",
      icon: Lightbulb,
    },
    {
      name: "History",
      path: "/history",
      icon: History,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: User,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-slate-900 border-r border-slate-800 z-50">

      {/* ================= Logo / Project Name ================= */}
      <div className="h-[130px] flex items-center px-6 border-b border-slate-800">

        <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center">
          <BrainCircuit className="w-8 h-8 text-white" />
        </div>

        <div className="ml-4">
          <h1 className="text-white font-bold text-lg leading-tight">
            AI Digital Fatigue
          </h1>

          <p className="text-slate-400 text-sm">
            Burnout Detection
          </p>
        </div>

      </div>

      {/* ================= Navigation ================= */}
      <nav className="p-4 space-y-2">

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon className="w-5 h-5" />

              <span className="font-medium">
                {item.name}
              </span>
            </NavLink>
          );
        })}

      </nav>

    </aside>
  );
};

export default Sidebar;