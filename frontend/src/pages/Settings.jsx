import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Moon,
  BrainCircuit,
  ShieldCheck,
} from "lucide-react";

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [aiMonitoring, setAiMonitoring] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="max-w-[1700px] mx-auto px-8 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Settings
        </h1>

        <p className="mt-2 text-slate-400">
          Manage your monitoring preferences and application settings.
        </p>
      </div>

      {/* General Settings */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon
            className="text-blue-400"
            size={24}
          />

          <h2 className="text-xl font-bold text-white">
            General Settings
          </h2>
        </div>

        <div className="space-y-5">

          {/* Notifications */}
          <div className="flex items-center justify-between rounded-xl bg-slate-800/50 p-5">

            <div className="flex items-center gap-4">

              <Bell
                className="text-yellow-400"
                size={22}
              />

              <div>
                <h3 className="font-medium text-white">
                  Notifications
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Receive fatigue and break reminders.
                </p>
              </div>

            </div>

            <button
              onClick={() =>
                setNotifications(!notifications)
              }
              className={`relative h-6 w-11 rounded-full transition ${
                notifications
                  ? "bg-blue-600"
                  : "bg-slate-600"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  notifications
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>

          </div>

          {/* AI Monitoring */}
          <div className="flex items-center justify-between rounded-xl bg-slate-800/50 p-5">

            <div className="flex items-center gap-4">

              <BrainCircuit
                className="text-purple-400"
                size={22}
              />

              <div>
                <h3 className="font-medium text-white">
                  AI Monitoring
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Allow the system to continuously analyze activity.
                </p>
              </div>

            </div>

            <button
              onClick={() =>
                setAiMonitoring(!aiMonitoring)
              }
              className={`relative h-6 w-11 rounded-full transition ${
                aiMonitoring
                  ? "bg-blue-600"
                  : "bg-slate-600"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  aiMonitoring
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>

          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between rounded-xl bg-slate-800/50 p-5">

            <div className="flex items-center gap-4">

              <Moon
                className="text-blue-400"
                size={22}
              />

              <div>
                <h3 className="font-medium text-white">
                  Dark Mode
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Use the dark interface for comfortable viewing.
                </p>
              </div>

            </div>

            <button
              onClick={() =>
                setDarkMode(!darkMode)
              }
              className={`relative h-6 w-11 rounded-full transition ${
                darkMode
                  ? "bg-blue-600"
                  : "bg-slate-600"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  darkMode
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>

          </div>

        </div>

      </div>

      {/* AI & Privacy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* AI Status */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center gap-3">
            <BrainCircuit
              className="text-blue-400"
              size={24}
            />

            <h2 className="text-xl font-bold text-white">
              AI Configuration
            </h2>
          </div>

          <div className="mt-6 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">

            <p className="font-semibold text-blue-400">
              AI Monitoring Active
            </p>

            <p className="mt-1 text-sm text-blue-300">
              Your activity is currently being monitored for
              fatigue and burnout indicators.
            </p>

          </div>

        </div>

        {/* Privacy */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center gap-3">
            <ShieldCheck
              className="text-emerald-400"
              size={24}
            />

            <h2 className="text-xl font-bold text-white">
              Privacy & Security
            </h2>
          </div>

          <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">

            <p className="font-semibold text-emerald-400">
              Data Protection Enabled
            </p>

            <p className="mt-1 text-sm text-emerald-300">
              Your monitoring data is protected by the application.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Settings;