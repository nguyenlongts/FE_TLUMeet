import React, { useState } from "react";
import {
  Video,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useRegisterNewUserMutation } from "../../redux/features/auth/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [registerNewUser, { isLoading }] = useRegisterNewUserMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      calculatePasswordStrength(value);
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    setPasswordStrength(Math.min(strength, 100));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "#ef4444";
    if (passwordStrength < 70) return "#eab308";
    return "#22c55e";
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "#ef4444";
    if (passwordStrength < 70) return "#eab308";
    return "#22c55e";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return t("register.strength.weak");
    if (passwordStrength < 70) return t("register.strength.medium");
    return t("register.strength.strong");
  };

  const getStrengthText = getPasswordStrengthText;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = t("register.validation.fullNameRequired");
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = t("register.validation.fullNameMin");
    } else if (!/^[\p{L}\s]+$/u.test(formData.fullName.trim())) {
      newErrors.fullName = t("register.validation.fullNameInvalid");
    }

    if (!formData.email) {
      newErrors.email = t("register.validation.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("register.validation.emailInvalid");
    }

    if (!formData.password) {
      newErrors.password = t("register.validation.passwordRequired");
    } else if (formData.password.length < 6) {
      newErrors.password = t("register.validation.passwordMin");
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("register.validation.confirmPasswordRequired");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("register.validation.confirmPasswordMismatch");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const response = await registerNewUser({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      }).unwrap();
      console.log(response);
      toast.success(t("register.toast.success"));
      navigate("/login");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error?.data?.message || t("register.toast.error"));
    }
  };

  const inputClass = (field) =>
    `w-full py-3 pl-12 pr-4 border rounded-xl tracking-wide text-[#5a5478] placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors ${
      errors[field]
        ? "border-red-500/60 bg-red-500/5"
        : "border-[#2a2245] bg-[#0f0a1e]"
    }`;

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0b0919] py-8">
      <div className="p-8 bg-[#150f2a] border border-[#2a2245] rounded-lg w-full max-w-md mx-4">

        {/* Language switcher */}
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={() => i18n.changeLanguage("vi")}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              i18n.language === "vi"
                ? "bg-purple-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            VI
          </button>
          <button
            onClick={() => i18n.changeLanguage("en")}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              i18n.language === "en"
                ? "bg-purple-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            EN
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white">{t("register.title")}</h1>
          <p className="text-slate-400">{t("register.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white">
              {t("register.fullNameLabel")}
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder={t("register.fullNamePlaceholder")}
                className={inputClass("fullName")}
              />
            </div>
            {errors.fullName && (
              <p className="mt-1.5 text-xs text-red-400">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white">
              {t("register.emailLabel")}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("register.emailPlaceholder")}
                className={inputClass("email")}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white">
              {t("register.passwordLabel")}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("register.passwordPlaceholder")}
                className={`${inputClass("password")} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">{t("register.passwordStrength")}</span>
                  <span className="text-xs font-medium" style={{ color: getPasswordStrengthColor() }}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-[#2a2245] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${passwordStrength}%`,
                      backgroundColor: getPasswordStrengthColor(),
                    }}
                  />
                </div>
              </div>
            )}
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white">
              {t("register.confirmPasswordLabel")}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t("register.confirmPasswordPlaceholder")}
                className={`${inputClass("confirmPassword")} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="w-4 h-4 mt-0.5 border rounded cursor-pointer bg-slate-700 border-slate-600 accent-violet-500"
            />
            <span className="text-slate-400">
              {t("register.terms")}{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                {t("register.termsLink")}
              </a>{" "}
              {t("register.and")}{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                {t("register.privacyLink")}
              </a>
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 font-semibold text-white transition-all duration-300 shadow-lg !bg-gradient-to-r !from-violet-600 !to-purple-500 rounded-xl hover:shadow-blue-500/50 hover:shadow-2xl cursor-pointer transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t("register.signingUp")}
              </span>
            ) : (
              t("register.signUp")
            )}
          </button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-white bg-[#150f2a]">
                {t("register.orContinueWith")}
              </span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="py-3 font-medium text-white transition-all border bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 rounded-xl hover:border-slate-600/50"
            >
              Google
            </button>
            <button
              type="button"
              className="py-3 font-medium text-white transition-all border bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 rounded-xl hover:border-slate-600/50"
            >
              Facebook
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-slate-400">
          {t("register.hasAccount")}{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
          >
            {t("register.signIn")}
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;