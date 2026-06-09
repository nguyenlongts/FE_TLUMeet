import React from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-indigo-600 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">
          Trang không tồn tại
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Xin lỗi, trang bạn đang tìm kiếm không được tìm thấy.
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-[var(--content)] rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          <Home className="w-5 h-5" />
          <span>Về trang chủ</span>
        </button>
      </div>
    </div>
  );
}

export default NotFoundPage;
