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

{/* ================= Live Activity + AI Status ================= */}

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

  {/* Activity Chart */}
  <div className="lg:col-span-2 h-full">
    <ActivityChart />
  </div>

  {/* AI Status */}
  <div className="lg:col-span-1 h-full">

    <div
      className="
        h-full
        bg-slate-900
        rounded-2xl
        border
        border-slate-800
        p-6
        shadow-lg
        transition-all
        duration-300
        hover:border-blue-500/40
        hover:shadow-blue-500/10
      "
    >

      <h2 className="text-xl font-bold text-white mb-6">
        AI Status
      </h2>

      <div className="space-y-7">

        {/* Fatigue Score */}
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

        {/* Burnout Risk */}
        <div>
          <p className="text-slate-400">
            Burnout Risk
          </p>

          <h2 className="text-3xl font-bold text-green-400 mt-2">
            LOW
          </h2>
        </div>

        {/* AI Confidence */}
        <div>
          <p className="text-slate-400">
            AI Confidence
          </p>

          <h2 className="text-3xl font-bold text-blue-400 mt-2">
            96%
          </h2>
        </div>

        {/* Recommendation */}
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

</div>

      {/* ================= Application & Keyboard Activity ================= */}

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

  {/* Application Usage */}
  <div className="w-full">
    <ApplicationPieChart />
  </div>

  {/* Keyboard vs Mouse Activity */}
  <div className="w-full">
    <KeyboardMouseChart />
  </div>

</div>

      {/* ================= Environment + AI Recommendation ================= */}

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

  {/* ================= Environment ================= */}

  <div
    className="
      bg-slate-900
      rounded-2xl
      border
      border-slate-800
      p-6
      shadow-lg
      transition-all
      duration-300
      hover:border-blue-500/40
      hover:shadow-blue-500/10
    "
  >

    {/* Header */}

    <div className="flex items-center gap-3 mb-8">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
        <Thermometer
          size={22}
          className="text-blue-400"
        />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">
          Environment
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Current workspace conditions
        </p>
      </div>

    </div>


    {/* Environment Metrics */}

    <div className="space-y-5">

      {/* Temperature */}

      <div className="flex items-center justify-between rounded-xl bg-slate-800/50 p-4">

        <div>
          <p className="text-sm text-slate-400">
            Temperature
          </p>

          <p className="text-xs text-slate-600 mt-1">
            Room temperature
          </p>
        </div>

        <span className="text-lg font-semibold text-white">
          27°C
        </span>

      </div>


      {/* Light */}

      <div className="flex items-center justify-between rounded-xl bg-slate-800/50 p-4">

        <div>
          <p className="text-sm text-slate-400">
            Light
          </p>

          <p className="text-xs text-slate-600 mt-1">
            Ambient light level
          </p>
        </div>

        <span className="text-lg font-semibold text-white">
          420 Lux
        </span>

      </div>


      {/* Brightness */}

      <div className="flex items-center justify-between rounded-xl bg-slate-800/50 p-4">

        <div>
          <p className="text-sm text-slate-400">
            Screen Brightness
          </p>

          <p className="text-xs text-slate-600 mt-1">
            Current display level
          </p>
        </div>

        <span className="text-lg font-semibold text-white">
          80%
        </span>

      </div>


      {/* Battery */}

      <div className="flex items-center justify-between rounded-xl bg-slate-800/50 p-4">

        <div>
          <p className="text-sm text-slate-400">
            Battery
          </p>

          <p className="text-xs text-slate-600 mt-1">
            Device battery level
          </p>
        </div>

        <span className="text-lg font-semibold text-emerald-400">
          87%
        </span>

      </div>

    </div>

  </div>


  {/* ================= AI Recommendation ================= */}

  <div
    className="
      bg-slate-900
      rounded-2xl
      border
      border-slate-800
      p-6
      shadow-lg
      transition-all
      duration-300
      hover:border-yellow-500/30
      hover:shadow-yellow-500/5
    "
  >

    {/* Header */}

    <div className="flex items-center gap-3 mb-8">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/10">
        <Lightbulb
          size={22}
          className="text-yellow-400"
        />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">
          AI Recommendation
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Personalized suggestions based on your activity
        </p>
      </div>

    </div>


    {/* Recommendation List */}

    <div className="space-y-4">

      <div className="flex gap-3 rounded-xl bg-slate-800/50 p-4">

        <span className="mt-1 text-blue-400">
          •
        </span>

        <p className="text-sm leading-relaxed text-slate-300">
          Take a 5–10 minute break every hour.
        </p>

      </div>


      <div className="flex gap-3 rounded-xl bg-slate-800/50 p-4">

        <span className="mt-1 text-blue-400">
          •
        </span>

        <p className="text-sm leading-relaxed text-slate-300">
          Reduce screen brightness in low-light conditions.
        </p>

      </div>


      <div className="flex gap-3 rounded-xl bg-slate-800/50 p-4">

        <span className="mt-1 text-blue-400">
          •
        </span>

        <p className="text-sm leading-relaxed text-slate-300">
          Maintain a comfortable typing and sitting posture.
        </p>

      </div>


      <div className="flex gap-3 rounded-xl bg-slate-800/50 p-4">

        <span className="mt-1 text-blue-400">
          •
        </span>

        <p className="text-sm leading-relaxed text-slate-300">
          Stay hydrated during long work sessions.
        </p>

      </div>


      <div className="flex gap-3 rounded-xl bg-slate-800/50 p-4">

        <span className="mt-1 text-blue-400">
          •
        </span>

        <p className="text-sm leading-relaxed text-slate-300">
          Avoid continuous work sessions longer than 2 hours.
        </p>

      </div>

    </div>

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