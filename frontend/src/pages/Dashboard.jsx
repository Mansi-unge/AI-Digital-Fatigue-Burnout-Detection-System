import React from "react";
import MetricCard from "../components/dashboard/MetricCard";
import ActivityChart from "../components/dashboard/ActivityChart";
import ApplicationPieChart from "../components/dashboard/ApplicationPieChart";
import KeyboardMouseChart from "../components/dashboard/KeyboardMouseChart";
import OverviewBanner from "../components/dashboard/OverviewBanner";

import {
  Clock3,
  Keyboard,
  Mouse,
  Battery,
  BrainCircuit,
  Flame,
  Thermometer,
  Lightbulb,
  ClipboardList,
  Briefcase,
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="max-w-[1700px] mx-auto space-y-8">

      {/* ================= Dashboard Title ================= */}
      <div>
        <h1 className="text-4xl font-bold text-white">
          AI Monitoring Dashboard
        </h1>

        <p className="text-slate-400 mt-2 text-lg">
          Real-time Digital Fatigue & Burnout Analysis
        </p>
      </div>

<div className="space-y-8">

    <OverviewBanner />

    {/* Metric Cards */}

    {/* Charts */}

    {/* Environment */}

</div>

      {/* ================= Metric Cards ================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 xl:grid-cols-3 gap-6">

        <MetricCard
  title="Screen Time"
  value="6h 45m"
  icon={Clock3}
  color="bg-blue-600"
  trend="+12%"
  progress={82}
  status="Healthy"
  updated="2 min ago"
/>

<MetricCard
  title="Typing Speed"
  value="68"
  unit="WPM"
  icon={Keyboard}
  color="bg-green-600"
  trend="+8%"
  progress={76}
  status="Healthy"
  updated="Just now"
/>

<MetricCard
  title="Mouse Activity"
  value="542"
  unit="Clicks"
  icon={Mouse}
  color="bg-purple-600"
  trend="+5%"
  progress={69}
  status="Healthy"
  updated="1 min ago"
/>

<MetricCard
  title="Fatigue Score"
  value="42"
  unit="%"
  icon={BrainCircuit}
  color="bg-orange-500"
  trend="-3%"
  progress={42}
  status="Warning"
  updated="Live"
/>

<MetricCard
  title="Burnout Risk"
  value="18"
  unit="%"
  icon={Flame}
  color="bg-red-600"
  trend="-7%"
  progress={18}
  status="Healthy"
  updated="Live"
/>

<MetricCard
  title="Battery"
  value="87"
  unit="%"
  icon={Battery}
  color="bg-emerald-600"
  trend="+2%"
  progress={87}
  status="Healthy"
  updated="Just now"
/>

      </div>

      {/* ================= Activity + AI Status ================= */}

      <div className="grid grid-cols-12 gap-6">

        {/* Activity Chart */}
        <div className="col-span-8">
          <ActivityChart />
        </div>

        {/* AI Status */}
        <div className="col-span-4 bg-slate-900 hover:shadow-blue-500/10
hover:border-blue-500/40
transition-all
duration-300 rounded-2xl border border-slate-800 p-6 shadow-lg">

          <h2 className="text-xl font-bold text-white mb-6">
            AI Status
          </h2>

          <div className="space-y-7">

            <div>
              <p className="text-slate-400">
                Fatigue Score
              </p>

              <h1 className="text-5xl font-bold text-orange-400 mt-2">
                42%
              </h1>

              <div className="w-full h-3 rounded-full bg-slate-700 mt-4">
                <div className="w-[42%] h-3 rounded-full bg-orange-500"></div>
              </div>

            </div>

            <div>
              <p className="text-slate-400">
                Burnout Risk
              </p>

              <h2 className="text-3xl font-bold text-green-400 mt-2">
                LOW
              </h2>
            </div>

            <div>
              <p className="text-slate-400">
                AI Confidence
              </p>

              <h2 className="text-3xl font-bold text-blue-400 mt-2">
                96%
              </h2>
            </div>

            <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4">

              <h3 className="font-semibold text-green-400">
                Recommendation
              </h3>

              <p className="text-green-300 text-sm mt-2">
                Continue working. Take a short break after 30 minutes.
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* ================= Pie + Bar ================= */}

      <div className="grid grid-cols-12 gap-6">

        <div className="col-span-3">
          <ApplicationPieChart />
        </div>

        <div className="col-span-3">
          <KeyboardMouseChart />
        </div>

      </div>

      {/* ================= Environment + Recommendation ================= */}

      <div className="grid grid-cols-12 gap-6">

        <div className="col-span-5 bg-slate-900 hover:shadow-blue-500/10
hover:border-blue-500/40
transition-all
duration-300 rounded-2xl border border-slate-800 p-6">

          <div className="flex items-center gap-3 mb-10">
            <Thermometer className="text-blue-400" />
            <h2 className="text-xl font-bold text-white">
              Environment
            </h2>
          </div>

          <div className="space-y-5 text-slate-300">

            <div className="flex justify-between">
              <span>Temperature</span>
              <span>27°C</span>
            </div>

            <div className="flex justify-between">
              <span>Light</span>
              <span>420 Lux</span>
            </div>

            <div className="flex justify-between">
              <span>Brightness</span>
              <span>80%</span>
            </div>

            <div className="flex justify-between">
              <span>Battery</span>
              <span>87%</span>
            </div>

          </div>

        </div>

        <div className="col-span-7 bg-slate-900 hover:shadow-blue-500/10
hover:border-blue-500/40
transition-all
duration-300 rounded-2xl border border-slate-800 p-6">

          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="text-yellow-400" />
            <h2 className="text-xl font-bold text-white">
              AI Recommendation
            </h2>
          </div>

          <ul className="space-y-4 text-slate-300 list-disc pl-5">
            <li>Take a 5–10 minute break every hour.</li>
            <li>Reduce screen brightness in low-light conditions.</li>
            <li>Maintain typing posture.</li>
            <li>Stay hydrated.</li>
            <li>Avoid continuous work sessions longer than 2 hours.</li>
          </ul>

        </div>

      </div>

      {/* ================= Activity + Work Summary ================= */}

      <div className="grid grid-cols-12 gap-6">

        <div className="col-span-6 bg-slate-900 hover:shadow-blue-500/10
hover:border-blue-500/40
transition-all
duration-300 rounded-2xl border border-slate-800 p-6">

          <div className="flex items-center gap-3 mb-5">
            <ClipboardList className="text-cyan-400" />
            <h2 className="text-xl font-bold text-white">
              Recent Activity
            </h2>
          </div>

          <div className="space-y-4 text-slate-300">

            <p>09:30 AM • VS Code Opened</p>
            <p>10:15 AM • Chrome Active</p>
            <p>11:20 AM • Break Started</p>
            <p>11:35 AM • Work Resumed</p>
            <p>01:10 PM • Fatigue Increased</p>

          </div>

        </div>

        <div className="col-span-6 bg-slate-900 hover:shadow-blue-500/10
hover:border-blue-500/40
transition-all
duration-300 rounded-2xl border border-slate-800 p-6">

          <div className="flex items-center gap-3 mb-5">
            <Briefcase className="text-emerald-400" />
            <h2 className="text-xl font-bold text-white">
              Today's Summary
            </h2>
          </div>

          <div className="space-y-5 text-slate-300">

            <div className="flex justify-between">
              <span>Total Work</span>
              <span>6h 45m</span>
            </div>

            <div className="flex justify-between">
              <span>Break Time</span>
              <span>45 min</span>
            </div>

            <div className="flex justify-between">
              <span>Applications Used</span>
              <span>12</span>
            </div>

            <div className="flex justify-between">
              <span>Productivity</span>
              <span className="text-green-400 font-semibold">
                Excellent
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;