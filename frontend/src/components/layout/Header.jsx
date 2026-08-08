import React, { useEffect, useState } from "react";
import {
  Search,
  Bell,
  BrainCircuit,
  Clock3,
  UserCircle2,
} from "lucide-react";

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full h-[88px] flex items-center justify-between px-8 bg-slate-950 border-b border-slate-800">

      {/* Left Section */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-white">
          Dashboard
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Welcome back, Amruta 👋
        </p>
      </div>

      {/* Middle Section */}
      <div className="hidden md:flex items-center bg-slate-800 rounded-xl px-4 py-2 w-[320px] border border-slate-700">

        <Search
          size={18}
          className="text-slate-400"
        />

        <input
          type="text"
          placeholder="Search..."
          className="ml-3 w-full bg-transparent outline-none text-white placeholder:text-slate-500"
        />

      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">

        {/* Monitoring Status */}
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-xl">

          <BrainCircuit
            size={18}
            className="text-green-400"
          />

          <span className="text-green-400 text-sm font-medium">
            Monitoring Active
          </span>

        </div>

        {/* Notification */}
        <button className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition">

          <Bell
            size={20}
            className="text-white"
          />

          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500"></span>

        </button>

        {/* Time */}
        <div className="flex items-center gap-2 text-slate-300">

          <Clock3 size={18} />

          <span className="text-sm whitespace-nowrap">
            {currentTime.toLocaleTimeString()}
          </span>

        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">

          <UserCircle2
            size={34}
            className="text-blue-400"
          />

          <div>

            <p className="text-sm text-white font-semibold">
              Amruta
            </p>

            <p className="text-xs text-slate-400">
              Research User
            </p>

          </div>

        </div>

      </div>

    </header>
  );
};

export default Header;