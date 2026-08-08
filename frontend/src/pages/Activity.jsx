import React from "react";
import {
  Activity as ActivityIcon,
  Clock3,
  Keyboard,
  Mouse,
  Monitor,
  TrendingUp,
} from "lucide-react";
import ActivityChart from "../components/dashboard/ActivityChart";
import ActivityFeed from "../components/dashboard/ActivityFeed";

const Activity = () => {
  const metrics = [
    {
      title: "Screen Time",
      value: "6h 45m",
      description: "Today's total",
      icon: Clock3,
      iconStyle: "bg-blue-500/10 text-blue-400",
    },
    {
      title: "Typing Speed",
      value: "68 WPM",
      description: "Average speed",
      icon: Keyboard,
      iconStyle: "bg-emerald-500/10 text-emerald-400",
    },
    {
      title: "Mouse Activity",
      value: "542",
      description: "Total clicks",
      icon: Mouse,
      iconStyle: "bg-purple-500/10 text-purple-400",
    },
    {
      title: "Applications",
      value: "12",
      description: "Applications used",
      icon: Monitor,
      iconStyle: "bg-cyan-500/10 text-cyan-400",
    },
  ];

  return (
    <div className="max-w-[1700px] mx-auto px-8 py-8 space-y-8">

      {/* ================= PAGE HEADER ================= */}

      <div className="flex items-center gap-4">

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
          <ActivityIcon
            size={28}
            className="text-white"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white">
            Activity Monitoring
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Monitor your digital activity and work behaviour
            throughout the day.
          </p>
        </div>

      </div>


      {/* ================= METRIC CARDS ================= */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {metrics.map((metric) => {

          const Icon = metric.icon;

          return (
            <div
              key={metric.title}
              className="
                rounded-2xl
                border
                border-slate-800
                bg-slate-900
                p-5
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-blue-500/30
                hover:shadow-xl
                hover:shadow-blue-500/5
              "
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-400">
                    {metric.title}
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-white">
                    {metric.value}
                  </h2>

                  <p className="mt-2 text-xs text-slate-500">
                    {metric.description}
                  </p>

                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${metric.iconStyle}`}
                >
                  <Icon size={23} />
                </div>

              </div>


              <div className="mt-5 flex items-center gap-2 border-t border-slate-800 pt-4">

                <TrendingUp
                  size={15}
                  className="text-emerald-400"
                />

                <span className="text-xs font-semibold text-emerald-400">
                  Healthy activity
                </span>

              </div>

            </div>
          );
        })}

      </div>

      {/* ================= CHART + RECENT ACTIVITY ================= */}

<div className="grid grid-cols-1 gap-6 xl:grid-cols-12">

  {/* Activity Chart */}

  <div className="xl:col-span-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

    <div className="mb-6">

      <h2 className="text-xl font-bold text-white">
        Activity Timeline
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Your digital activity throughout the day
      </p>

    </div>

    <div className="min-h-[320px]">
      <ActivityChart />
    </div>

  </div>


  {/* Recent Activity */}

  <div className="xl:col-span-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">

    <div className="mb-6">

      <h2 className="text-xl font-bold text-white">
        Recent Activity
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Latest activities detected
      </p>

    </div>

    <div className="max-h-[320px] overflow-y-auto pr-2">
      <ActivityFeed />
    </div>

  </div> 

</div>
    </div>
  );
};

export default Activity;