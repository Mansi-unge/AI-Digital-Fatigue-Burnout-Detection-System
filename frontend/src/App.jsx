import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

// ================= LANDING / AUTH =================
import LandingPage from "./pages/LandingPage/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

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


// <<<<<<< HEAD
// import { Routes, Route, Navigate } from "react-router-dom";

// import MainLayout from "./components/layout/MainLayout";

// // ================= AUTH PAGES =================
// import Splash from "./pages/Splash";
// // import Login from "./pages/auth/Login";
// // import Register from "./pages/auth/Register";
// // import ForgotPassword from "./pages/auth/ForgotPassword";
// // import ResetPassword from "./pages/auth/ResetPassword";

// // ================= MAIN PAGES =================
// import Dashboard from "./pages/Dashboard";
// import Activity from "./pages/Activity";
// import Environment from "./pages/Environment";
// import Prediction from "./pages/Prediction";
// import Reports from "./pages/Reports";
// import History from "./pages/History";
// import Recommendations from "./pages/Recommendations";
// import Profile from "./pages/Profile";
// import Settings from "./pages/Settings";

// function App() {
//   return (
//     <Routes>

//       {/* ================= AUTH SECTION ================= */}

//       <Route
//         path="/"
//         element={<Splash />}
//       />

//       <Route
//         path="/login"
//         element={<Login />}
//       />

//       <Route
//         path="/register"
//         element={<Register />}
//       />

//       <Route
//         path="/forgot-password"
//         element={<ForgotPassword />}
//       />

//       <Route
//         path="/reset-password"
//         element={<ResetPassword />}
//       />


//       {/* ================= MAIN APPLICATION ================= */}

//       {/* Dashboard */}
//       <Route
//         path="/dashboard"
//         element={
//           <MainLayout>
//             <Dashboard />
//           </MainLayout>
//         }
//       />

//       {/* Activity */}
//       <Route
//         path="/activity"
//         element={
//           <MainLayout>
//             <Activity />
//           </MainLayout>
//         }
//       />

//       {/* Environment */}
//       <Route
//         path="/environment"
//         element={
//           <MainLayout>
//             <Environment />
//           </MainLayout>
//         }
//       />

//       {/* Prediction */}
//       <Route
//         path="/prediction"
//         element={
//           <MainLayout>
//             <Prediction />
//           </MainLayout>
//         }
//       />

//       {/* Reports */}
//       <Route
//         path="/reports"
//         element={
//           <MainLayout>
//             <Reports />
//           </MainLayout>
//         }
//       />

//       {/* History */}
//       <Route
//         path="/history"
//         element={
//           <MainLayout>
//             <History />
//           </MainLayout>
//         }
//       />

//       {/* Recommendations */}
//       <Route
//         path="/recommendations"
//         element={
//           <MainLayout>
//             <Recommendations />
//           </MainLayout>
//         }
//       />

//       {/* Profile */}
//       <Route
//         path="/profile"
//         element={
//           <MainLayout>
//             <Profile />
//           </MainLayout>
//         }
//       />

//       {/* Settings */}
//       <Route
//         path="/settings"
//         element={
//           <MainLayout>
//             <Settings />
//           </MainLayout>
//         }
//       />


//       {/* ================= FALLBACK ================= */}

//       <Route
//         path="*"
//         element={<Navigate to="/" replace />}
//       />

//     </Routes>
// =======
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import LandingPage from "./pages/LandingPage/LandingPage";
// import Login from "./pages/auth/Login";
// import Register from "./pages/auth/Register/Register";
// import Dashboard from "./pages/dashboard/Dashboard";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         {/* Landing Page */}
//         <Route path="/" element={<LandingPage />} />

//         {/* Authentication */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         {/* 404 */}
//         <Route
//           path="*"
//           element={
//             <div className="h-screen flex items-center justify-center bg-slate-100">
//               <div className="text-center">
//                 <h1 className="text-5xl font-bold text-slate-800">404</h1>
//                 <p className="mt-2 text-slate-600">Page Not Found</p>
//               </div>
//             </div>
//           }
//         />

//       </Routes>
//     </BrowserRouter>
// >>>>>>> bcc5f2ee1bdeed6fcbb9bf6d4a13304a85582d08
//   );
// }

// export default App;