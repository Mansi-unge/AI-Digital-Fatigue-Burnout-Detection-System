import React from "react";
import {
  Lightbulb,
  Clock3,
  Monitor,
  Droplets,
  Armchair,
  Moon,
} from "lucide-react";

const Recommendations = () => {
  return (
    <div className="max-w-[1700px] mx-auto px-8 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          AI Recommendations
        </h1>

        <p className="mt-2 text-slate-400">
          Personalized suggestions to reduce digital fatigue and maintain healthy work habits.
        </p>
      </div>

      {/* Current Status */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">

        <div className="flex items-center gap-3">
          <Lightbulb className="text-yellow-400" size={26} />

          <div>
            <h2 className="text-xl font-bold text-white">
              Current Recommendation Status
            </h2>

            <p className="mt-1 text-sm text-emerald-300">
              Your current fatigue level is within a healthy range.
            </p>
          </div>
        </div>

      </div>

      {/* Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Break */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <Clock3 className="text-blue-400" size={28} />

          <h3 className="mt-5 text-lg font-semibold text-white">
            Take Regular Breaks
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Take a 5–10 minute break after approximately one hour of continuous screen activity.
          </p>

        </div>

        {/* Screen */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <Monitor className="text-purple-400" size={28} />

          <h3 className="mt-5 text-lg font-semibold text-white">
            Adjust Screen Brightness
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Keep your screen brightness comfortable for the surrounding environment.
          </p>

        </div>

        {/* Hydration */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <Droplets className="text-cyan-400" size={28} />

          <h3 className="mt-5 text-lg font-semibold text-white">
            Stay Hydrated
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Remember to drink water regularly during long work sessions.
          </p>

        </div>

        {/* Posture */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <Armchair className="text-orange-400" size={28} />

          <h3 className="mt-5 text-lg font-semibold text-white">
            Maintain Good Posture
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Keep your back supported and position your monitor at a comfortable viewing height.
          </p>

        </div>

        {/* Screen Time */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <Clock3 className="text-emerald-400" size={28} />

          <h3 className="mt-5 text-lg font-semibold text-white">
            Manage Screen Time
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Avoid extended periods of uninterrupted digital activity.
          </p>

        </div>

        {/* Rest */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <Moon className="text-indigo-400" size={28} />

          <h3 className="mt-5 text-lg font-semibold text-white">
            Prioritize Rest
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Maintain adequate rest between demanding work sessions to support recovery.
          </p>

        </div>

      </div>

    </div>
  );
};

export default Recommendations;