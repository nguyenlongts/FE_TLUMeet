import React from "react";
import UpdateProfile from "./UpdateProfile";
import { useAuth } from "../context/AuthContext";
import DashboardHeader from "../components/DashboardHeader";

function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Vui lòng đăng nhập để xem trang này.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UpdateProfile />
      </div>
    </div>
  );
}

export default ProfilePage;
