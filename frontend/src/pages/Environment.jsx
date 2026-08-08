import React from "react";
import EnvironmentCard from "../components/dashboard/EnvironmentCard";

const Environment = () => {
  return (
    <div className="max-w-[1700px] mx-auto px-8 py-8 space-y-8">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Environment Monitoring
        </h1>

        <p className="mt-2 text-slate-400">
          Monitor your workspace conditions in real time.
        </p>
      </div>

      {/* Environment Card */}
      <EnvironmentCard />

    </div>
  );
};

export default Environment;