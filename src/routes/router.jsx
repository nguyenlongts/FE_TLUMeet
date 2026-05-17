import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import CalendarPage from "../pages/user/CalendarPage";
import LoginForm from "../components/LoginForm";
import WaitingRoom from "../pages/meetings/WaitingRoom";
import Home from "../pages/home/Home";
import Register from "../pages/login/Register";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute"; // ✅ thêm
import MeetingPage from "../pages/meetings/MeetingPage";
import MeetingRoom from "../pages/meetings/MeetingRoom";
import Dashboard from "../pages/dashboard/Dashboard";
import ProfilePage from "../pages/profile/ProfilePage";
import AppLayout from "../components/AppLayout";
import ForgotPasswordPage from "../components/ForgotPasswordPage";
import ResetPasswordPage from "../pages/login/ResetPasswordPage";
import ChangePasswordPage from "../pages/login/ChangePasswordPage";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <LoginForm /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
      { path: "/register", element: <Register /> },
      { path: "/waiting-room", element: <WaitingRoom /> },
      { path: "/meet/:roomName", element: <MeetingRoom /> },

      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <App />,
            children: [
              { path: "/dashboard", element: <Dashboard /> },
              { path: "/calendar", element: <CalendarPage /> },
              { path: "/profile", element: <ProfilePage /> },
              { path: "/meetings", element: <MeetingPage /> },
              { path: "/change-password", element: <ChangePasswordPage /> },
            ],
          },
        ],
      },

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },

  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin", element: <StatsPage /> },
          { path: "/admin/users", element: <UsersManagement /> },
          { path: "/admin/meetings", element: <MeetingsManagement/>}
        ],
      },
    ],
  },
]);

export default router;
