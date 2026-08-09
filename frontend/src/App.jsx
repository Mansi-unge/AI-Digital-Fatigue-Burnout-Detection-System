import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

// ================= LANDING / AUTH =================
import LandingPage from "./pages/LandingPage/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register/Register";

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
      {/* ================= LANDING ================= */}

      <Route
        path="/"
        element={<LandingPage />}
      />

      {/* ================= AUTH ================= */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* ================= MAIN APPLICATION ================= */}

      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        }
      />

      <Route
        path="/activity"
        element={
          <MainLayout>
            <Activity />
          </MainLayout>
        }
      />

      <Route
        path="/environment"
        element={
          <MainLayout>
            <Environment />
          </MainLayout>
        }
      />

      <Route
        path="/prediction"
        element={
          <MainLayout>
            <Prediction />
          </MainLayout>
        }
      />

      <Route
        path="/reports"
        element={
          <MainLayout>
            <Reports />
          </MainLayout>
        }
      />

      <Route
        path="/history"
        element={
          <MainLayout>
            <History />
          </MainLayout>
        }
      />

      <Route
        path="/recommendations"
        element={
          <MainLayout>
            <Recommendations />
          </MainLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <MainLayout>
            <Profile />
          </MainLayout>
        }
      />

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