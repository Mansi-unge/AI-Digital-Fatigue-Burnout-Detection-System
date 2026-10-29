import React, { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Monitor,
  Keyboard,
  MousePointer2,
  AppWindow,
  Clock3,
  Camera,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Save,
} from "lucide-react";

import {
  getSettings,
  updateSettings,
} from "../api/settingsApi";

const defaultSettings = {
  monitoring_enabled: true,
  keyboard_monitoring: true,
  mouse_monitoring: true,
  screen_monitoring: true,
  idle_monitoring: true,
  application_monitoring: true,

  // Camera ON by default
  webcam_monitoring: true,

  notifications_enabled: true,
  break_reminders: true,
  fatigue_alerts: true,

  theme: "light",
};

const Settings = () => {
  const [settings, setSettings] = useState(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // GET USER ID
  // ==========================================================

  const getUserId = () => {
    const storedUser =
      localStorage.getItem("user") ||
      localStorage.getItem("userData");

    if (!storedUser) return null;

    try {
      const parsedUser = JSON.parse(storedUser);

      return (
        parsedUser?.id ||
        parsedUser?.user_id ||
        parsedUser?.userId ||
        null
      );
    } catch {
      return null;
    }
  };

  // ==========================================================
  // LOAD SETTINGS
  // ==========================================================

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const userId = getUserId();

        if (!userId) {
          setError(
            "User ID not found. Please login again."
          );
          return;
        }

        const response = await getSettings(userId);

        if (!response?.success) {
          setError(
            response?.message ||
              "Unable to load settings."
          );
          return;
        }

        setSettings({
          ...defaultSettings,
          ...response.settings,
        });
      } catch (err) {
        console.error(
          "Settings loading error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load settings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // ==========================================================
  // CHANGE SETTING
  // ==========================================================

  const handleChange = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    setSuccess("");
    setError("");
  };

  // ==========================================================
  // SAVE SETTINGS
  // ==========================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const userId = getUserId();

      if (!userId) {
        setError(
          "User ID not found. Please login again."
        );
        return;
      }

      const response = await updateSettings(
        userId,
        settings
      );

      if (!response?.success) {
        setError(
          response?.message ||
            "Failed to save settings."
        );
        return;
      }

      setSettings({
        ...defaultSettings,
        ...response.settings,
      });

      setSuccess("Settings saved successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Settings update error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 px-6 py-6">

        <div className="mx-auto max-w-[1200px]">

          <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="text-center">

              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading settings...
              </p>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================================
  // ERROR WITHOUT SETTINGS
  // ==========================================================

  if (error && !settings) {
    return (
      <div className="min-h-full bg-slate-50 px-6 py-6">

        <div className="mx-auto max-w-[1200px]">

          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">

            <p className="text-sm font-semibold text-red-600">
              {error}
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 lg:px-8">

      <div className="mx-auto max-w-[1200px] space-y-5">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">

                <SettingsIcon
                  size={16}
                  className="text-blue-600"
                />

              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                Application
              </span>

            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-800 lg:text-3xl">
              Settings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your monitoring and notification preferences.
            </p>

          </div>

          {/* SAVE */}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-blue-600
              px-5
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

            <Save size={16} />

            {saving ? "Saving..." : "Save Changes"}

          </button>

        </div>

        {/* ====================================================
            SUCCESS
        ==================================================== */}

        {success && (

          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

            <CheckCircle2
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

        {error && (

          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <p className="text-sm font-semibold text-red-600">
              {error}
            </p>

          </div>

        )}

        {/* ====================================================
            MONITORING
        ==================================================== */}

        <SettingsCard
          icon={<Monitor size={18} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          title="Monitoring"
          description="Choose which activity sources VitaSense can use."
        >

          {/* KEYBOARD */}

          <SettingRow
            icon={<Keyboard size={17} />}
            title="Keyboard Monitoring"
            description="Collect keyboard activity during monitoring."
            checked={settings.keyboard_monitoring}
            onChange={() =>
              handleChange("keyboard_monitoring")
            }
          />

          {/* MOUSE */}

          <SettingRow
            icon={<MousePointer2 size={17} />}
            title="Mouse Monitoring"
            description="Collect mouse activity during monitoring."
            checked={settings.mouse_monitoring}
            onChange={() =>
              handleChange("mouse_monitoring")
            }
          />

          {/* SCREEN */}

          <SettingRow
            icon={<Monitor size={17} />}
            title="Screen Monitoring"
            description="Track screen activity and usage time."
            checked={settings.screen_monitoring}
            onChange={() =>
              handleChange("screen_monitoring")
            }
          />

          {/* APPLICATION */}

          <SettingRow
            icon={<AppWindow size={17} />}
            title="Application Monitoring"
            description="Track the applications being used."
            checked={settings.application_monitoring}
            onChange={() =>
              handleChange("application_monitoring")
            }
          />

          {/* IDLE */}

          <SettingRow
            icon={<Clock3 size={17} />}
            title="Idle Monitoring"
            description="Detect periods of inactivity."
            checked={settings.idle_monitoring}
            onChange={() =>
              handleChange("idle_monitoring")
            }
          />

          {/* WEBCAM */}

          <SettingRow
            icon={<Camera size={17} />}
            title="Camera Access"
            description="Allow camera-based fatigue and attention analysis."
            checked={settings.webcam_monitoring}
            onChange={() =>
              handleChange("webcam_monitoring")
            }
          />

          {/* CAMERA DEFAULT NOTICE */}

          <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">

            <div className="flex items-start gap-3">

              <Camera
                size={16}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>

                <p className="text-xs font-semibold text-blue-700">
                  Camera access is enabled by default
                </p>

                <p className="mt-1 text-[11px] leading-5 text-blue-600">
                  You can turn it off at any time from this setting.
                </p>

              </div>

            </div>

          </div>

        </SettingsCard>

        {/* ====================================================
            NOTIFICATIONS
        ==================================================== */}

        <SettingsCard
          icon={<Bell size={18} />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          title="Notifications"
          description="Choose which alerts and reminders you want to receive."
        >

          {/* NOTIFICATIONS */}

          <SettingRow
            icon={<Bell size={17} />}
            title="Notifications"
            description="Receive VitaSense fatigue and monitoring notifications."
            checked={settings.notifications_enabled}
            onChange={() =>
              handleChange("notifications_enabled")
            }
          />

          {/* BREAK REMINDERS */}

          <SettingRow
            icon={<Clock3 size={17} />}
            title="Break Reminders"
            description="Receive reminders when it is time to take a break."
            checked={
              settings.break_reminders &&
              settings.notifications_enabled
            }
            disabled={!settings.notifications_enabled}
            onChange={() =>
              handleChange("break_reminders")
            }
          />

          {/* FATIGUE ALERTS */}

          <SettingRow
            icon={<ShieldCheck size={17} />}
            title="Fatigue Alerts"
            description="Receive alerts when fatigue indicators need attention."
            checked={
              settings.fatigue_alerts &&
              settings.notifications_enabled
            }
            disabled={!settings.notifications_enabled}
            onChange={() =>
              handleChange("fatigue_alerts")
            }
          />

        </SettingsCard>

        {/* ====================================================
            APPEARANCE
        ==================================================== */}

        <SettingsCard
          icon={<Monitor size={18} />}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          title="Appearance"
          description="VitaSense currently uses the light application interface."
        >

          <div className="flex items-center justify-between gap-4 px-1 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">

                <Monitor
                  size={17}
                  className="text-slate-500"
                />

              </div>

              <div>

                <p className="text-sm font-semibold text-slate-700">
                  Light Mode
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  Clean interface recommended for VitaSense.
                </p>

              </div>

            </div>

            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5">

              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-semibold text-emerald-600">
                Active
              </span>

            </div>

          </div>

        </SettingsCard>

        {/* ====================================================
            SECURITY
        ==================================================== */}

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">

              <ShieldCheck
                size={17}
                className="text-emerald-600"
              />

            </div>

            <div>

              <p className="text-sm font-semibold text-slate-700">
                VitaSense Security
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                Your settings are associated with your account.
              </p>

            </div>

          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">

            <CheckCircle2 size={14} />

            Protected

          </div>

        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div className="border-t border-slate-200 pt-4 pb-3 text-center text-[11px] text-slate-400">

          VitaSense • AI Powered Digital Fatigue Detection

        </div>

      </div>

    </div>
  );
};

// ==========================================================
// SETTINGS CARD
// ==========================================================

const SettingsCard = ({
  icon,
  iconBg,
  iconColor,
  title,
  description,
  children,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}
        >
          <span className={iconColor}>
            {icon}
          </span>
        </div>

        <div>

          <h2 className="text-sm font-bold text-slate-800">
            {title}
          </h2>

          <p className="mt-0.5 text-xs text-slate-400">
            {description}
          </p>

        </div>

      </div>

      <div className="px-5 py-1">
        {children}
      </div>

    </div>
  );
};

// ==========================================================
// SETTING ROW
// ==========================================================

const SettingRow = ({
  icon,
  title,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <div
      className={`
        flex
        items-center
        justify-between
        gap-4
        border-b
        border-slate-100
        px-1
        py-4
        last:border-b-0
        ${disabled ? "opacity-50" : ""}
      `}
    >

      <div className="flex min-w-0 items-center gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">

          <span className="text-slate-500">
            {icon}
          </span>

        </div>

        <div className="min-w-0">

          <p className="text-sm font-semibold text-slate-700">
            {title}
          </p>

          <p className="mt-0.5 text-xs leading-5 text-slate-400">
            {description}
          </p>

        </div>

      </div>

      <Toggle
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />

    </div>
  );
};

// ==========================================================
// TOGGLE
// ==========================================================

const Toggle = ({
  checked,
  disabled,
  onChange,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`
        relative
        h-6
        w-11
        shrink-0
        rounded-full
        transition
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-blue-200

        ${
          checked
            ? "bg-blue-600"
            : "bg-slate-200"
        }

        ${
          disabled
            ? "cursor-not-allowed"
            : "cursor-pointer"
        }
      `}
    >

      <span
        className={`
          absolute
          top-1
          h-4
          w-4
          rounded-full
          bg-white
          shadow-sm
          transition
          duration-200

          ${
            checked
              ? "left-6"
              : "left-1"
          }
        `}
      />

    </button>
  );
};

export default Settings;