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
import AdminLayout from "../components/AdminLayout";
import AdminHome from "../pages/admin/AdminHome";
import UsersManagement from "../pages/admin/UsersManagement";
import StatsPage from "../pages/admin/stats/StatsPage";
import MeetingsManagement from "../pages/admin/meetings/MeetingsManagement";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <LoginForm /> },
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
