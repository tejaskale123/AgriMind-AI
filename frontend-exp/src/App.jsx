import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Crops from "./pages/Crops";
import DiseaseDetection from "./pages/DiseaseDetection";
import Analytics from "./pages/Analytics";
import CropManagement from "./pages/CropManagement";
import AIInsights from "./pages/AIInsights";
import DetectionHistory from "./pages/DetectionHistory";
import LearningHub from "./pages/LearningHub";
import Settings from "./pages/Settings";
import WeatherAdvisory from "./pages/WeatherAdvisory";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { LanguageProvider } from "./context/LanguageContext";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token") || localStorage.getItem("token") || localStorage.getItem("accessToken");
  const user = localStorage.getItem("user");
  
  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isLandingPage = location.pathname === "/";

  // Landing page is accessible to anyone without login
  if (isLandingPage) {
    return <LandingPage />;
  }

  // Auth pages accessible directly
  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  // All other app routes are protected: direct unauthenticated users to /login
  return (
    <ProtectedRoute>
      <div className="exp-app-container">
        {/* Permanent Sidebar matching mockup */}
        <Sidebar />

        {/* Main Content Panel */}
        <main className="exp-main-wrapper">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/crops" element={<Crops />} />
            <Route path="/detection" element={<DiseaseDetection />} />
            <Route path="/management" element={<CropManagement />} />
            <Route path="/crop-management" element={<CropManagement />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/history" element={<DetectionHistory />} />
            <Route path="/detection-history" element={<DetectionHistory />} />
            <Route path="/insights" element={<AIInsights />} />
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/ai-insights/risk-analysis" element={<AIInsights />} />
            <Route path="/weather" element={<WeatherAdvisory />} />
            <Route path="/learning" element={<LearningHub />} />
            <Route path="/learning-hub" element={<LearningHub />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </LanguageProvider>
  );
}
