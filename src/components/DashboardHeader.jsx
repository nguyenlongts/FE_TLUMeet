import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Lock, LogOut, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
// import NotificationBell from "./NotificationBell";

function DashboardHeader() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  // const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Xin chào,...!
            <span className="text-xs text-gray-400 ml-2">("email")</span>
          </p>
        </div>
        <div className="flex items-center space-x-3 relative">
          <button
            onClick={() => navigate("/create-meeting")}
            className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-[var(--content)] rounded-lg hover:bg-indigo-700 transition font-medium shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>Tạo phòng mới</span>
          </button>

          {/* Nút thông báo kiểu FB */}
          {/* <NotificationBell /> */}

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              <Eye className="w-5 h-5" />
              <span className="hidden sm:inline">Tài khoản</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border z-50">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate("/profile");
                  }}
                  className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Cập nhật thông tin</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate("/change-password");
                  }}
                  className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Đổi mật khẩu</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2 rounded-b-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
