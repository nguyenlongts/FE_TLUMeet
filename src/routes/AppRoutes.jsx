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
import HistoryPage from "../pages/History";
import NotFoundPage from "../pages/NotFound";
import MeetingRoom from "../pages/Meeting";
import AdminPanel from "../pages/AdminPanel";

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

          <Route
            path="/history"
            element={
              <ProtectedRoute requiredRole="User">
                <HistoryPage />
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
