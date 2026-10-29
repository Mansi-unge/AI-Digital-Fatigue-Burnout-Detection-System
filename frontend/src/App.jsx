import { Routes, Route, Navigate } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./pages/auth/ProtectedRoute";

// ================= LANDING / AUTH =================

import LandingPage from "./pages/LandingPage/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register/Register";

// ================= MODE SELECTION =================

import ChooseMode from "./pages/ChooseMode/ChooseMode";

// ================= MAIN PAGES =================

import Dashboard from "./pages/dashboard/Dashboard";
import Activity from "./pages/Activity/Activity";
import Environment from "./pages/Enviornment/Environment";
import Reports from "./pages/Reports/Reports";
import Prediction from "./pages/Fatigue_prediction/Prediction";
import Recommendations from "./pages/Recommendations/Recommendations";
import History from "./pages/History/History";
import SessionDetails from "./pages/History/SessionDetails";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import CameraData from "./pages/CameraData/CameraData";
import Notifications from "./pages/Notification/Notifications";


function App() {

  return (

    <>

      <Routes>


        {/* =====================================================
            LANDING
        ===================================================== */}

        <Route
          path="/"
          element={<LandingPage />}
        />


        {/* =====================================================
            AUTH
        ===================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =====================================================
            PROTECTED MODE SELECTION
        ===================================================== */}

        <Route
          path="/choose-mode"
          element={
            <ProtectedRoute>
              <ChooseMode />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            PROTECTED MAIN APPLICATION
        ===================================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Activity />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/environment"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Environment />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/fatigue-prediction"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Prediction />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/camera-data"
          element={
            <MainLayout>
              <CameraData />
            </MainLayout>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Reports />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <MainLayout>
                <History />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/history/:sessionId"
          element={<SessionDetails />}
        />


        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Recommendations />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Notifications />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            FALLBACK
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>


      {/* =====================================================
          TOAST NOTIFICATIONS
      ===================================================== */}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

    </>

  );

}

export default App;