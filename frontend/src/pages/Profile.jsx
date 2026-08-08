import React from "react";
import {
  User,
  Mail,
  CalendarDays,
  Briefcase,
  ShieldCheck,
} from "lucide-react";

const Profile = () => {
  return (
    <div className="max-w-[1700px] mx-auto px-8 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          My Profile
        </h1>

        <p className="mt-2 text-slate-400">
          Manage your personal information and account details.
        </p>
      </div>

      {/* Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

          <div className="flex flex-col items-center text-center">

            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white shadow-lg">
              A
            </div>

            <h2 className="mt-5 text-2xl font-bold text-white">
              Amruta Shete
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Research User
            </p>

            <div className="mt-5 rounded-full bg-emerald-500/10 px-4 py-2">
              <span className="text-sm font-medium text-emerald-400">
                Active Account
              </span>
            </div>

          </div>

        </div>

        {/* Personal Information */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-8">

          <div className="flex items-center gap-3 mb-8">
            <User className="text-blue-400" size={24} />

            <h2 className="text-xl font-bold text-white">
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Name */}
            <div>
              <div className="flex items-center gap-2 text-slate-400">
                <User size={17} />
                <span className="text-sm">
                  Full Name
                </span>
              </div>

              <p className="mt-2 text-white font-medium">
                Amruta Shete
              </p>
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail size={17} />
                <span className="text-sm">
                  Email
                </span>
              </div>

              <p className="mt-2 text-white font-medium">
                user@example.com
              </p>
            </div>

            {/* Role */}
            <div>
              <div className="flex items-center gap-2 text-slate-400">
                <Briefcase size={17} />
                <span className="text-sm">
                  Role
                </span>
              </div>

              <p className="mt-2 text-white font-medium">
                Research User
              </p>
            </div>

            {/* Joined */}
            <div>
              <div className="flex items-center gap-2 text-slate-400">
                <CalendarDays size={17} />
                <span className="text-sm">
                  Joined
                </span>
              </div>

              <p className="mt-2 text-white font-medium">
                August 2026
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Account Status */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="flex items-center gap-3">
          <ShieldCheck
            className="text-emerald-400"
            size={24}
          />

          <h2 className="text-xl font-bold text-white">
            Account Status
          </h2>
        </div>

        <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">

          <p className="font-semibold text-emerald-400">
            Account Verified
          </p>

          <p className="mt-1 text-sm text-emerald-300">
            Your account is active and ready for AI monitoring.
          </p>

        </div>

      </div>

    </div>
  );
};

export default Profile;