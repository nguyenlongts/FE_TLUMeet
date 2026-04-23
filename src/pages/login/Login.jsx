import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
  const API_BASE = "http://localhost:5555";
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState(null);
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
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  const decodeJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
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

  const handleLogin = async () => {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setLoginError("");

    try {
      const response = await fetch(`${API_BASE}/api/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.statusCode === 200) {
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

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userInfo));

        login(userInfo, token);
        setMessage({ type: "success", text: "Đăng nhập thành công 🎉" });

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
      const response = await fetch(`${API_BASE}/api/Auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

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
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <button
          onClick={handleBackToHome}
          className="flex items-center mb-6 space-x-2 text-gray-600 transition hover:text-gray-900 group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span>Quay lại trang chủ</span>
        </button>

        {/* Logo & Title */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-[#2D8CFF] p-3 rounded-2xl shadow-lg">
              <Video className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Chào mừng trở lại
          </h1>
          <p className="text-gray-600">Đăng nhập để tiếp tục vào TLU Meeting</p>
        </div>

        {/* Login Form */}
        <div className="p-8 bg-white border border-gray-200 shadow-xl rounded-2xl">
          {message && (
            <div
              className={`flex items-start p-4 mb-6 space-x-3 border rounded-lg ${
                message.type === "error"
                  ? "border-red-200 bg-red-50"
                  : "border-green-200 bg-green-50"
              }`}
            >
              {message.type === "error" ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <Check className="w-5 h-5 text-green-600" />
              )}

              <p
                className={`text-sm ${
                  message.type === "error" ? "text-red-700" : "text-green-700"
                }`}
              >
                {message.text}
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
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
                <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
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
                  className="absolute text-gray-400 transition transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
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
            <div className="pt-4 text-center border-t border-gray-200">
              <p className="text-sm text-gray-600">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-2xl animate-fade-in">
            {forgotSuccess ? (
              // Success Message
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                  Đã gửi email!
                </h2>
                <p className="mb-6 text-gray-600">
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
                <div className="mb-6 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
                    <Mail className="w-8 h-8 text-[#2D8CFF]" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-gray-900">
                    Quên mật khẩu?
                  </h2>
                  <p className="text-gray-600">
                    Nhập email của bạn để nhận liên kết đặt lại mật khẩu
                  </p>
                </div>

                {forgotError && (
                  <div className="flex items-start p-4 mb-4 space-x-3 border border-red-200 rounded-lg bg-red-50">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{forgotError}</p>
                  </div>
                )}

                <form
                  onSubmit={handleForgotPasswordSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
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
                      className="flex-1 py-3 font-medium text-gray-700 transition border-2 border-gray-300 rounded-lg hover:bg-gray-50"
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
