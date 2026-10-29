import React from "react";
import {
  Eye,
  Activity,
  Brain,
  Smile,
} from "lucide-react";

const CameraAttentionCard = ({ latest }) => {
  const blinkRate = latest?.blink_rate;
  const eyeClosure = latest?.eye_closure;
  const yawnCount = latest?.yawn_count;
  const headPose = latest?.head_pose;

  const formatValue = (value, fallback = "--") => {
    return value !== null && value !== undefined
      ? value
      : fallback;
  };

  return (
    <div
      className="
        bg-white
       rounded-lg
        border border-slate-200
        p-6
        shadow-sm
        hover:shadow-md
        transition
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Camera & Attention
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Real-time camera monitoring
          </p>
        </div>

        <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center">
          <Eye
            size={21}
            className="text-violet-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Blink Rate */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
          <div className="flex items-center gap-3">

            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Eye
                size={18}
                className="text-blue-600"
              />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Blink Rate
              </p>

              <p className="text-lg font-semibold text-slate-800">
                {formatValue(blinkRate)} /min
              </p>
            </div>

          </div>
        </div>

        {/* Eye Closure */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
          <div className="flex items-center gap-3">

            <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center">
              <Activity
                size={18}
                className="text-orange-500"
              />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Eye Closure
              </p>

              <p className="text-lg font-semibold text-slate-800">
                {formatValue(eyeClosure)}%
              </p>
            </div>

          </div>
        </div>

        {/* Yawns */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
          <div className="flex items-center gap-3">

            <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Smile
                size={18}
                className="text-amber-500"
              />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Yawns
              </p>

              <p className="text-lg font-semibold text-slate-800">
                {formatValue(yawnCount)}
              </p>
            </div>

          </div>
        </div>

        {/* Head Pose */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
          <div className="flex items-center gap-3">

            <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Brain
                size={18}
                className="text-emerald-600"
              />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Head Pose
              </p>

              <p className="text-lg font-semibold text-slate-800 uppercase">
                {formatValue(headPose)}
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CameraAttentionCard;
