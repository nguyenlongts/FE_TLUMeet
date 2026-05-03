import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import CalendarPage from "../pages/user/CalendarPage";
import LoginForm from "../components/LoginForm";
import WaitingRoom from "../pages/meetings/WaitingRoom";
import Home from "../pages/home/Home"
import Register from '../pages/login/Register'
import ProtectedRoute from "./ProtectedRoute"
import MeetingPage from "../pages/meetings/MeetingPage";
import MeetingRoom from "../pages/meetings/MeetingRoom";
import Dashboard from "../pages/dashboard/Dashboard";
import ProfilePage from "../pages/profile/ProfileModal";
import PublicRoute from "./PublicRote";
import ForgotPasswordPage from "../components/ForgotPasswordPage";
const router =createBrowserRouter([
    {
    element: <ProtectedRoute />,      
    children: [
      {
        element: <App />,              
        children: [
          { path: "dashboard", element: <Dashboard />, index:true},
          { path: "calendar", element: <CalendarPage /> },
          { path: "profile", element: <ProfilePage /> },
          {path:'meetings',element:<MeetingPage/>},
        ],
      },
    ],
    },
    {
      element:<PublicRoute/>,
      children:[
        {
        path:"/",
        element:<Home/>
        },
        {
        path:"/login",
        element:<LoginForm/>
        },
        {path:"/register",
        element:<Register/>
        },
        {path:"/forgot-password",
          element:<ForgotPasswordPage/>
        }
      ]
    },
    {
        path:"/waiting-room",
        element:<WaitingRoom/>
    },
    {
      path:"/meet/:roomName",
      element:<MeetingRoom/>
    }
])
export default router