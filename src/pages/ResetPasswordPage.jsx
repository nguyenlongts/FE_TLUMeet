import { useSearchParams, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    if (password.length < 6) return setError("Mật khẩu tối thiểu 6 ký tự");
    if (password !== confirm) return setError("Mật khẩu không khớp");

    const res = await fetch(
      "https://kiritsu2210-001-site1.rtempurl.com/api/auth/reset-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      }
    );

    const data = await res.json();
    if (data.returnCode === 200) {
      alert("Đặt lại mật khẩu thành công");
      navigate("/login");
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-indigo-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Đặt lại mật khẩu
        </h1>
        <p className="text-gray-500 mb-6">Vui lòng nhập mật khẩu mới</p>

        {errors.api && (
          <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{errors.api}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
              <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
            )}
          </div>

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
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
