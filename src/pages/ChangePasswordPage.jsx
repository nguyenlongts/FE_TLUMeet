import React, { useState } from "react";
import { Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";

function ChangePasswordPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const err = {};

    if (!formData.currentPassword) {
      err.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!formData.newPassword) {
      err.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (formData.newPassword.length < 6) {
      err.newPassword = "Mật khẩu mới tối thiểu 6 ký tự";
    }

    if (formData.confirmPassword !== formData.newPassword) {
      err.confirmPassword = "Xác nhận mật khẩu không khớp";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const payload = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      };
      const res = await fetch(
        "https://kiritsu2210-001-site1.rtempurl.com/api/Auth/change-password",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (data.returnCode === 200) {
        alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setErrors({
          api: data.message || "Đổi mật khẩu thất bại",
        });
      }
    } catch (error) {
      console.error(error);
      setErrors({ api: "Không thể kết nối máy chủ" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader />

      {/* Content */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-gray-600 hover:text-indigo-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Đổi mật khẩu
          </h1>
          <p className="text-gray-500 mb-6">
            Vui lòng nhập mật khẩu hiện tại và mật khẩu mới
          </p>
          {errors.api && (
            <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{errors.api}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Mật khẩu hiện tại
              </label>
              <div className="relative mt-1">
                <input
                  type={show.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShow({ ...show, current: !show.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {show.current ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Mật khẩu mới
              </label>
              <div className="relative mt-1">
                <input
                  type={show.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShow({ ...show, new: !show.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {show.new ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Xác nhận mật khẩu
              </label>
              <div className="relative mt-1">
                <input
                  type={show.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShow({ ...show, confirm: !show.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {show.confirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
