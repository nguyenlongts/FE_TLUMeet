// src/router/PublicRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectRefreshToken } from "../redux/features/auth/authSlice";

const PublicRoute = ({ redirectTo = "/dashboard" }) => {
  const refreshToken = useSelector(selectRefreshToken);

  if (refreshToken) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;