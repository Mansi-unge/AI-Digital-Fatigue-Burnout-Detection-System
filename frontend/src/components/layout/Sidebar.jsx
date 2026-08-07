import React from "react";
import { NavLink } from "react-router-dom";
import {
  BrainCircuit,
  LayoutDashboard,
  Activity,
  Monitor,
  BarChart3,
  History,
  Lightbulb,
  User,
  Settings,
  LogOut,
} from "lucide-react";

/**
 * Professional Desktop Sidebar
 * AI Digital Fatigue & Burnout Detection System
 */

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Activity", icon: Activity, path: "/activity" },
  { name: "Environment", icon: Monitor, path: "/environment" },
  { name: "Prediction", icon: BrainCircuit, path: "/prediction" },
  { name: "Reports", icon: BarChart3, path: "/reports" },
  { name: "History", icon: History, path: "/history" },
  { name: "Recommendations", icon: Lightbulb, path: "/recommendations" },
  { name: "Profile", icon: User, path: "/profile" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-slate-900 border-r border-slate-700 text-slate-100 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">
              AI Digital Fatigue
            </h1>
            <p className="text-xs text-slate-400 leading-tight">
              Burnout Detection
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
            A
          </div>
          <div>
            <p className="text-sm font-semibold">Amruta Shete</p>
            <p className="text-xs text-slate-400">Research User</p>
          </div>
        </div>

        <button className="w-full flex items-center gap-3 rounded-xl border border-slate-700 px-4 py-3 text-slate-300 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-200">
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
