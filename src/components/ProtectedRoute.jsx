import React from "react";
import { Navigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2D8CFF] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const userRole =
      user.role ||
      (localStorage.getItem("user") &&
        JSON.parse(localStorage.getItem("user")).role);

    if (userRole !== requiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Không có quyền truy cập
              </h2>
              <p className="text-gray-600 mb-6">
                Bạn không có quyền truy cập trang này.
              </p>
              <div className="text-sm text-gray-500 mb-6 p-4 bg-gray-50 rounded-lg">
                <p>
                  Role của bạn:{" "}
                  <strong className="text-gray-900">
                    {userRole || "Unknown"}
                  </strong>
                </p>
                <p>
                  Role yêu cầu:{" "}
                  <strong className="text-gray-900">{requiredRole}</strong>
                </p>
              </div>
              <button
                onClick={() => {
                  const correctPath =
                    userRole === "Admin" ? "/admin" : "/dashboard";
                  window.location.href = correctPath;
                }}
                className="w-full px-6 py-3 bg-[#2D8CFF] text-[var(--content)] rounded-lg hover:bg-[#0B5CFF] transition font-medium"
              >
                Quay về Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
