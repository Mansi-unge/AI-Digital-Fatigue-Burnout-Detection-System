import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

// ================= AUTH PAGES =================
import Splash from "./pages/Splash";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// ================= MAIN PAGES =================
import Dashboard from "./pages/Dashboard";
import Activity from "./pages/Activity";
import Environment from "./pages/Environment";
import Prediction from "./pages/Prediction";
import Reports from "./pages/Reports";
import History from "./pages/History";
import Recommendations from "./pages/Recommendations";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>

      {/* ================= AUTH SECTION ================= */}

      <Route
        path="/"
        element={<Splash />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />


      {/* ================= MAIN APPLICATION ================= */}

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        }
      />

      {/* Activity */}
      <Route
        path="/activity"
        element={
          <MainLayout>
            <Activity />
          </MainLayout>
        }
      />

      {/* Environment */}
      <Route
        path="/environment"
        element={
          <MainLayout>
            <Environment />
          </MainLayout>
        }
      />

      {/* Prediction */}
      <Route
        path="/prediction"
        element={
          <MainLayout>
            <Prediction />
          </MainLayout>
        }
      />

      {/* Reports */}
      <Route
        path="/reports"
        element={
          <MainLayout>
            <Reports />
          </MainLayout>
        }
      />

      {/* History */}
      <Route
        path="/history"
        element={
          <MainLayout>
            <History />
          </MainLayout>
        }
      />

      {/* Recommendations */}
      <Route
        path="/recommendations"
        element={
          <MainLayout>
            <Recommendations />
          </MainLayout>
        }
      />

      {/* Profile */}
      <Route
        path="/profile"
        element={
          <MainLayout>
            <Profile />
          </MainLayout>
        }
      />

      {/* Settings */}
      <Route
        path="/settings"
        element={
          <MainLayout>
            <Settings />
          </MainLayout>
        }
      />


      {/* ================= FALLBACK ================= */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default App;