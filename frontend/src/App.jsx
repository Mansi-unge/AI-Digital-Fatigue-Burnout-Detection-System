import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="h-screen flex items-center justify-center bg-slate-100">
              <div className="text-center">
                <h1 className="text-5xl font-bold text-slate-800">404</h1>
                <p className="mt-2 text-slate-600">Page Not Found</p>
              </div>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;