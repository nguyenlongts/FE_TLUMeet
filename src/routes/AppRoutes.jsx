import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "../context/AuthContext";
import PublicRoute from "../components/PublicRoute";
import ProtectedRoute from "../components/ProtectedRoute";

import HomePage from "../pages/Home";
import LoginPage from "../pages/Login";
import RegisterPage from "../pages/Register";
import DashboardPage from "../pages/Dashboard";
import CreateMeetingPage from "../pages/CreateMeeting";
import ResetPasswordPage from "../pages/ResetPasswordPage.jsx";
import NotFoundPage from "../pages/NotFound";
import MeetingRoom from "../pages/Meeting";
import AdminPanel from "../pages/admin/AdminPanel";
import ChangePasswordPage from "../pages/ChangePasswordPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route path="/profile" element={<ProfilePage />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="User">
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-meeting"
            element={
              <ProtectedRoute requiredRole="User">
                <CreateMeetingPage />
              </ProtectedRoute>
            }
          />

          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route
            path="/change-password"
            element={
              <ProtectedRoute requiredRole="User">
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />
          <Route path="/meeting/:roomName" element={<MeetingRoom />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppRoutes;
