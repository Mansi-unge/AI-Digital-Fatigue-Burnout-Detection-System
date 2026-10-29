import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  CalendarDays,
  Briefcase,
  ShieldCheck,
  Phone,
  MapPin,
  Pencil,
  Save,
  X,
  CircleCheck,
  Fingerprint,
  Activity,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

import { getProfile, updateProfile } from "../api/profileApi";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // GET LOGGED-IN USER ID
  // ==========================================================

  const getUserId = () => {
    const storedUser =
      localStorage.getItem("user") ||
      localStorage.getItem("userData") ||
      localStorage.getItem("user_id");

    if (!storedUser) return null;

    try {
      const parsedUser = JSON.parse(storedUser);

      return (
        parsedUser.id ||
        parsedUser.user_id ||
        parsedUser.userId ||
        null
      );
    } catch {
      return storedUser;
    }
  };

  // ==========================================================
  // LOAD PROFILE
  // ==========================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const userId = getUserId();

        if (!userId) {
          setError("User ID not found. Please login again.");
          return;
        }

        const data = await getProfile(userId);

        if (!data.success) {
          setError(
            data.message || "Failed to load profile."
          );
          return;
        }

        setProfile(data.profile);
        setFormData(data.profile);
      } catch (err) {
        console.error("Profile loading error:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // SAVE PROFILE
  // ==========================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const userId = getUserId();

      if (!userId) {
        setError("User ID not found. Please login again.");
        return;
      }

      const data = await updateProfile(userId, {
        name: formData.name,
        mobile_number: formData.mobile_number,
        date_of_birth: formData.date_of_birth,
        address: formData.address,
        designation: formData.designation,
      });

      if (!data.success) {
        setError(
          data.message || "Failed to update profile."
        );
        return;
      }

      setProfile(data.profile);
      setFormData(data.profile);
      setEditing(false);
      setSuccess("Profile updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3500);
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // CANCEL EDIT
  // ==========================================================

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
    setError("");
    setSuccess("");
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 px-6 py-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">

          <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">

            <div className="flex flex-col items-center justify-center py-16">

              <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading profile...
              </p>

            </div>

          </div>

        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error && !profile) {
    return (
      <div className="min-h-full bg-slate-50 px-6 py-6 lg:px-8">

        <div className="mx-auto max-w-[1500px]">

          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">

                <X
                  size={20}
                  className="text-red-500"
                />

              </div>

              <div>

                <h2 className="font-semibold text-slate-800">
                  Unable to load profile
                </h2>

                <p className="mt-1 text-sm text-red-500">
                  {error}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================================
  // PROFILE VALUES
  // ==========================================================

  const initial =
    profile?.name?.charAt(0)?.toUpperCase() || "U";

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(
      "en-US",
      {
        month: "short",
        year: "numeric",
      }
    )
    : "August 2026";

  const accountId = profile?.id
    ? `USR-${String(profile.id).padStart(4, "0")}`
    : "USR-0000";

  // ==========================================================
  // PROFILE COMPLETENESS
  // ==========================================================

  const profileFields = [
    profile?.name,
    profile?.email,
    profile?.mobile_number,
    profile?.date_of_birth,
    profile?.address,
    profile?.designation,
  ];

  const completedFields = profileFields.filter(Boolean).length;

  const profileCompletion = Math.round(
    (completedFields / profileFields.length) * 100
  );

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="min-h-full bg-slate-50 p-4 lg:px-8">

      <div className="mx-auto max-w-[1500px] space-y-4">

        <div>

          <h1 className="text-8xl font-bold tracking-tight text-blue-700 lg:text-3xl">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your personal information and VitaSense account.
          </p>

        </div>

        {/* ====================================================
            SUCCESS
        ==================================================== */}

        {success && (

          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

            <CircleCheck
              size={18}
              className="text-emerald-600"
            />

            <span className="text-sm font-semibold text-emerald-700">
              {success}
            </span>

          </div>

        )}

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && profile && (

          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <X
              size={18}
              className="text-red-500"
            />

            <span className="text-sm font-semibold text-red-600">
              {error}
            </span>

          </div>

        )}

        {/* ====================================================
            PROFILE HERO
        ==================================================== */}

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Decorative background */}

          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-50/80 to-transparent" />

          <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-blue-100/40 blur-3xl" />

          <div className="relative flex flex-col gap-6 p-4 sm:flex-row sm:items-center sm:justify-between lg:p-5">

            {/* ==================================================
                USER INFORMATION
            ================================================== */}

            <div className="flex items-center gap-5">

              {/* AVATAR */}

              <div className="relative shrink-0">

                <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-blue-600 text-3xl font-bold text-white shadow-md shadow-blue-100">
                  {initial}
                </div>

                {/* ACTIVE DOT */}

                <div className="absolute -bottom-1.5 -right-1.5 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-emerald-500">

                  <span className="h-3 w-3 rounded-full bg-white" />

                </div>

              </div>

              {/* USER DETAILS */}

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="text-xl font-bold text-slate-800">
                    {profile?.name || "User"}
                  </h2>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    Active
                  </span>

                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {profile?.designation || "Research User"}
                </p>

                <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">

                  <Mail size={13} />

                  {profile?.email || "No email available"}

                </div>

              </div>

            </div>

            {/* ==================================================
                COMPLETION + EDIT
            ================================================== */}

            <div className="w-full sm:max-w-[260px] mr-4">

              {/* COMPLETION HEADER */}

              <div className="mb-2 flex items-center justify-between">

                <span className="text-xs font-semibold text-slate-500">
                  Profile completion
                </span>

                <span className="text-xs font-bold text-blue-600">
                  {profileCompletion}%
                </span>

              </div>

              {/* PROGRESS */}

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${profileCompletion}%`,
                  }}
                />

              </div>

              <p className="mt-2 text-[11px] text-slate-400">
                Keep your information up to date.
              </p>

              {/* ==================================================
                  EDIT / SAVE
              ================================================== */}

              <div className="mt-4">

                {!editing ? (

                  <button
                    onClick={() => {
                      setEditing(true);
                      setSuccess("");
                    }}
                    className="
                      group
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-blue-200
                      bg-blue-50
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-blue-600
                      transition-all
                      duration-200
                      hover:border-blue-300
                      hover:bg-blue-100
                      hover:text-blue-700
                    "
                  >

                    <Pencil
                      size={15}
                      className="transition-transform duration-200 group-hover:-rotate-6"
                    />

                    Edit Profile

                  </button>

                ) : (

                  <div className="flex gap-2">

                    {/* CANCEL */}

                    <button
                      onClick={handleCancel}
                      className="
                        flex
                        flex-1
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-3
                        py-2.5
                        text-sm
                        font-semibold
                        text-slate-600
                        transition
                        hover:bg-slate-50
                      "
                    >

                      <X size={15} />

                      Cancel

                    </button>

                    {/* SAVE */}

                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="
                        flex
                        flex-1
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-blue-600
                        px-3
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        shadow-sm
                        transition
                        hover:bg-blue-700
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >

                      <Save size={15} />

                      {saving ? "Saving..." : "Save"}

                    </button>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

        {/* ====================================================
            INFORMATION + ACCOUNT
        ==================================================== */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">

          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">

                  <User
                    size={17}
                    className="text-blue-600"
                  />

                </div>

                <div>

                  <h2 className="text-sm font-bold text-slate-800">
                    Personal Information
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Your registered account information
                  </p>

                </div>

              </div>

              {editing && (

                <span className="hidden items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-600 sm:flex">

                  <Pencil size={11} />

                  Editing

                </span>

              )}

            </div>

            {/* FIELDS */}

            <div className="grid grid-cols-1 gap-x-8 gap-y-1 p-6 md:grid-cols-3">

              <ProfileField
                icon={<User size={15} />}
                label="Full Name"
                name="name"
                value={formData.name}
                editing={editing}
                onChange={handleChange}
              />

              <ProfileField
                icon={<Mail size={15} />}
                label="Email Address"
                name="email"
                value={profile?.email}
                editing={false}
              />

              <ProfileField
                icon={<Phone size={15} />}
                label="Mobile Number"
                name="mobile_number"
                value={formData.mobile_number}
                editing={editing}
                onChange={handleChange}
              />

              <ProfileField
                icon={<Briefcase size={15} />}
                label="Designation"
                name="designation"
                value={formData.designation}
                editing={editing}
                onChange={handleChange}
              />

              <ProfileField
                icon={<CalendarDays size={15} />}
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                editing={editing}
                onChange={handleChange}
              />

              <ProfileField
                icon={<MapPin size={15} />}
                label="Address"
                name="address"
                value={formData.address}
                editing={editing}
                onChange={handleChange}
              />

            </div>

          </div>

          {/* ==================================================
              ACCOUNT OVERVIEW
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* HEADER */}

            <div className="border-b border-slate-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">

                  <ShieldCheck
                    size={17}
                    className="text-emerald-600"
                  />

                </div>

                <div>

                  <h2 className="text-sm font-bold text-slate-800">
                    Account Overview
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Security and access status
                  </p>

                </div>

              </div>

            </div>

            {/* ACCOUNT DETAILS */}

            <div className="space-y-1 p-5">

              <AccountRow
                icon={<Fingerprint size={15} />}
                label="Account ID"
                value={accountId}
              />

              <AccountRow
                icon={<CalendarDays size={15} />}
                label="Member Since"
                value={joinedDate}
              />

              <AccountRow
                icon={<Mail size={15} />}
                label="Email"
                value="Verified"
                valueClass="text-emerald-600"
              />

              <AccountRow
                icon={<LockKeyhole size={15} />}
                label="Account"
                value={
                  profile?.is_active !== false
                    ? "Active"
                    : "Inactive"
                }
                valueClass={
                  profile?.is_active !== false
                    ? "text-emerald-600"
                    : "text-red-500"
                }
              />

            </div>

          </div>

        </div>

        {/* ====================================================
            SECURITY STRIP
        ==================================================== */}

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">

              <CheckCircle2
                size={17}
                className="text-emerald-600"
              />

            </div>

            <div>

              <p className="text-sm font-semibold text-slate-700">
                Your account is secure
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                Your profile information is protected.
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">

            <ShieldCheck size={14} />

            VitaSense Security

          </div>

        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 pb-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

          <span>
            VitaSense • AI Powered Digital Fatigue Detection
          </span>

          <span>
            Account ID: {accountId}
          </span>

        </div>

      </div>

    </div>
  );
};

// ==========================================================
// PROFILE FIELD
// ==========================================================

const ProfileField = ({
  icon,
  label,
  name,
  value,
  type = "text",
  editing,
  onChange,
}) => {
  return (
    <div className="border-b border-slate-100 py-4 last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0">

      <div className="mb-2 flex items-center gap-2">

        <span className="text-slate-400">
          {icon}
        </span>

        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>

      </div>

      {editing ? (

        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

      ) : (

        <div className="px-0.5">

          <p className="truncate text-sm font-semibold text-slate-700">
            {value || "Not provided"}
          </p>

        </div>

      )}

    </div>
  );
};

// ==========================================================
// ACCOUNT ROW
// ==========================================================

const AccountRow = ({
  icon,
  label,
  value,
  valueClass = "text-slate-700",
}) => {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl px-2 py-3 transition hover:bg-slate-50">

      <div className="flex items-center gap-2.5">

        <span className="text-slate-400">
          {icon}
        </span>

        <span className="text-xs font-medium text-slate-500">
          {label}
        </span>

      </div>

      <span
        className={`text-right text-xs font-bold ${valueClass}`}
      >
        {value}
      </span>

    </div>
  );
};

export default Profile;