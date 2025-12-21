import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Video,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Check,
} from "lucide-react";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const from =
    location.state?.from ||
    sessionStorage.getItem("redirectAfterLogin") ||
    null;

  const decodeJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("JWT decode error:", err);
      return null;
    }
  };

  const navigateByRole = (role) => {
    const normalizedRole = role?.toString().trim().toLowerCase();
    if (normalizedRole === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setLoginError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Vui lòng nhập email";
    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setLoginError("");

    try {
      const response = await fetch(
        "https://kiritsu2210-001-site1.rtempurl.com/api/Auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok && result.returnCode === 200) {
        const token = result.data.token;
        const payload = decodeJwt(token);
        if (!payload) {
          setLoginError("Token không hợp lệ");
          return;
        }
        const role = payload.Role || payload.role || "User";

        const userInfo = {
          userId: payload.userId,
          name: payload.Name || payload.name || result.data.name,
          email: payload.Email || payload.email || result.data.email,
          role: role,
        };

        // Lưu token và user riêng biệt
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userInfo));

        // Pass token riêng để AuthContext xử lý
        login(userInfo, token); // ⬅️ Thay đổi ở đây

        if (from) {
          sessionStorage.removeItem("redirectAfterLogin");
          navigate(from, { replace: true });
        } else {
          navigateByRole(role);
        }
      } else {
        setLoginError(result.message || "Email hoặc mật khẩu không chính xác");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Không thể kết nối tới server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate("/", { replace: true });
  };

  // Forgot Password Handlers
  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setForgotEmail("");
    setForgotError("");
    setForgotSuccess(false);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotEmail("");
    setForgotError("");
    setForgotSuccess(false);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();

    if (!forgotEmail.trim()) {
      setForgotError("Vui lòng nhập email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setForgotError("Email không hợp lệ");
      return;
    }

    setIsSendingReset(true);
    setForgotError("");

    try {
      const response = await fetch(
        "https://kiritsu2210-001-site1.rtempurl.com/api/Auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail }),
        }
      );

      const result = await response.json();

      if (response.ok && result.returnCode === 200) {
        setForgotSuccess(true);
        setTimeout(() => {
          handleCloseForgotPassword();
        }, 3000);
      } else {
        setForgotError(result.message || "Email không tồn tại trong hệ thống");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setForgotError("Không thể kết nối tới server. Vui lòng thử lại.");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back to Home Button */}
        <button
          onClick={handleBackToHome}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại trang chủ</span>
        </button>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-[#2D8CFF] p-3 rounded-2xl shadow-lg">
              <Video className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng trở lại
          </h1>
          <p className="text-gray-600">Đăng nhập để tiếp tục vào TLU Meeting</p>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
          {loginError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className={`w-full pl-10 pr-4 py-3 bg-white border-2 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] focus:border-transparent transition`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className="text-sm text-[#2D8CFF] hover:text-[#0B5CFF] font-medium transition"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 bg-white border-2 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] focus:border-transparent transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-semibold transition shadow-lg ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#2D8CFF] hover:bg-[#0B5CFF] hover:shadow-xl"
              } text-white`}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            {/* Register Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-[#2D8CFF] hover:text-[#0B5CFF] font-medium transition"
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
            {forgotSuccess ? (
              // Success Message
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Đã gửi email!
                </h2>
                <p className="text-gray-600 mb-6">
                  Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.
                </p>
                <button
                  onClick={handleCloseForgotPassword}
                  className="w-full py-3 bg-[#2D8CFF] text-white rounded-lg hover:bg-[#0B5CFF] transition font-medium"
                >
                  Đóng
                </button>
              </div>
            ) : (
              // Forgot Password Form
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-[#2D8CFF]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Quên mật khẩu?
                  </h2>
                  <p className="text-gray-600">
                    Nhập email của bạn để nhận liên kết đặt lại mật khẩu
                  </p>
                </div>

                {forgotError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{forgotError}</p>
                  </div>
                )}

                <form
                  onSubmit={handleForgotPasswordSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          setForgotError("");
                        }}
                        placeholder="example@email.com"
                        className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleCloseForgotPassword}
                      className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingReset}
                      className={`flex-1 py-3 rounded-lg font-medium transition ${
                        isSendingReset
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#2D8CFF] hover:bg-[#0B5CFF]"
                      } text-white`}
                    >
                      {isSendingReset ? "Đang gửi..." : "Gửi email"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
