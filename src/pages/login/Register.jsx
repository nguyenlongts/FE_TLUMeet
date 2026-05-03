// import React, { useState } from "react";
// import {
//   Video,
//   Mail,
//   Lock,
//   User,
//   Eye,
//   EyeOff,
//   CheckCircle,
//   XCircle,
// } from "lucide-react";

// function RegisterPage() {
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [passwordStrength, setPasswordStrength] = useState(0);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     if (name === "password") {
//       calculatePasswordStrength(value);
//     }

//     if (errors[name]) {
//       setErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }));
//     }
//   };

//   const calculatePasswordStrength = (password) => {
//     let strength = 0;
//     if (password.length >= 6) strength += 25;
//     if (password.length >= 10) strength += 25;
//     if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
//     if (/[0-9]/.test(password)) strength += 15;
//     if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
//     setPasswordStrength(Math.min(strength, 100));
//   };

//   const getPasswordStrengthColor = () => {
//     if (passwordStrength < 40) return "bg-red-500";
//     if (passwordStrength < 70) return "bg-yellow-500";
//     return "bg-green-500";
//   };

//   const getPasswordStrengthText = () => {
//     if (passwordStrength < 40) return "Yếu";
//     if (passwordStrength < 70) return "Trung bình";
//     return "Mạnh";
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.fullName.trim()) {
//       newErrors.fullName = "Họ tên không được để trống";
//     } else if (formData.fullName.trim().length < 2) {
//       newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự";
//     } else if (!/^[\p{L}\s]+$/u.test(formData.fullName.trim())) {
//       newErrors.fullName = "Họ tên không được chứa số hoặc ký tự đặc biệt";
//     }

//     if (!formData.email) {
//       newErrors.email = "Email không được để trống";
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Email không hợp lệ";
//     }

//     if (!formData.password) {
//       newErrors.password = "Mật khẩu không được để trống";
//     } else if (formData.password.length < 6) {
//       newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
//     }

//     if (!formData.confirmPassword) {
//       newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
//     } else if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     setIsLoading(true);

//     try {
//       const response = await fetch("http://localhost:8081/api/Auth/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//         body: JSON.stringify({
//           name: formData.fullName,
//           email: formData.email,
//           password: formData.password,
//         }),
//       });

//       if (!response.ok) {
//         let errorMessage = "Đăng ký thất bại";

//         try {
//           const errorData = await response.json();
//           errorMessage = errorData?.message || errorMessage;
//         } catch {
//           errorMessage = response.statusText || errorMessage;
//         }

//         throw new Error(errorMessage);
//       }

//       alert("Đăng ký thành công!");
//       window.location.href = "/login";
//     } catch (error) {
//       console.error("Error:", error);
//       alert(error.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <div className="max-w-md w-full">
//         <div className="text-center mb-8">
//           <div className="flex justify-center mb-4">
//             <div className="bg-white p-3 rounded-2xl shadow-lg">
//               <Video className="w-12 h-12 text-indigo-600" />
//             </div>
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             Tạo tài khoản
//           </h1>
//           <p className="text-gray-600">Tham gia TLUHub ngay hôm nay</p>
//         </div>

//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           <div className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Họ và tên
//               </label>
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={formData.fullName}
//                   onChange={handleChange}
//                   placeholder="Nguyễn Văn A"
//                   className={`w-full pl-10 pr-4 py-3 border ${
//                     errors.fullName ? "border-red-300" : "border-gray-300"
//                   } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
//                 />
//               </div>
//               {errors.fullName && (
//                 <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="example@email.com"
//                   className={`w-full pl-10 pr-4 py-3 border ${
//                     errors.email ? "border-red-300" : "border-gray-300"
//                   } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
//                 />
//               </div>
//               {errors.email && (
//                 <p className="mt-1 text-sm text-red-600">{errors.email}</p>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Mật khẩu
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   placeholder="••••••••"
//                   className={`w-full pl-10 pr-12 py-3 border ${
//                     errors.password ? "border-red-300" : "border-gray-300"
//                   } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="w-5 h-5" />
//                   ) : (
//                     <Eye className="w-5 h-5" />
//                   )}
//                 </button>
//               </div>
//               {formData.password && (
//                 <div className="mt-2">
//                   <div className="flex items-center justify-between mb-1">
//                     <span className="text-xs text-gray-600">
//                       Độ mạnh mật khẩu:
//                     </span>
//                     <span
//                       className={`text-xs font-medium ${
//                         passwordStrength < 40
//                           ? "text-red-600"
//                           : passwordStrength < 70
//                             ? "text-yellow-600"
//                             : "text-green-600"
//                       }`}
//                     >
//                       {getPasswordStrengthText()}
//                     </span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div
//                       className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
//                       style={{ width: `${passwordStrength}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               )}
//               {errors.password && (
//                 <p className="mt-1 text-sm text-red-600">{errors.password}</p>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Xác nhận mật khẩu
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type={showConfirmPassword ? "text" : "password"}
//                   name="confirmPassword"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   placeholder="••••••••"
//                   className={`w-full pl-10 pr-12 py-3 border ${
//                     errors.confirmPassword
//                       ? "border-red-300"
//                       : "border-gray-300"
//                   } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showConfirmPassword ? (
//                     <EyeOff className="w-5 h-5" />
//                   ) : (
//                     <Eye className="w-5 h-5" />
//                   )}
//                 </button>
//               </div>
//               {errors.confirmPassword && (
//                 <p className="mt-1 text-sm text-red-600">
//                   {errors.confirmPassword}
//                 </p>
//               )}
//             </div>

//             <div className="flex items-start">
//               <input
//                 type="checkbox"
//                 className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1"
//               />
//               <label className="ml-2 text-sm text-gray-600">
//                 Tôi đồng ý với{" "}
//                 <a
//                   href="#"
//                   className="text-indigo-600 hover:text-indigo-700 font-medium"
//                 >
//                   Điều khoản dịch vụ
//                 </a>{" "}
//                 và{" "}
//                 <a
//                   href="#"
//                   className="text-indigo-600 hover:text-indigo-700 font-medium"
//                 >
//                   Chính sách bảo mật
//                 </a>
//               </label>
//             </div>

//             <button
//               onClick={handleSubmit}
//               disabled={isLoading}
//               className={`w-full py-3 rounded-lg font-medium transition ${
//                 isLoading
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-indigo-600 hover:bg-indigo-700"
//               } text-white`}
//             >
//               {isLoading ? (
//                 <span className="flex items-center justify-center">
//                   <svg
//                     className="animate-spin h-5 w-5 mr-3"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                       fill="none"
//                     />
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     />
//                   </svg>
//                   Đang đăng ký...
//                 </span>
//               ) : (
//                 "Đăng ký"
//               )}
//             </button>

//             <p className="text-center text-gray-600">
//               Đã có tài khoản?{" "}
//               <a
//                 href="/login"
//                 className="text-indigo-600 hover:text-indigo-700 font-medium"
//               >
//                 Đăng nhập ngay
//               </a>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default RegisterPage;
import React, { useState } from "react";
import {
  Video,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") calculatePasswordStrength(value);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "#ef4444";
    if (passwordStrength < 70) return "#eab308";
    return "#22c55e";
  };

  const getStrengthText = () => {
    if (passwordStrength < 40) return "Yếu";
    if (passwordStrength < 70) return "Trung bình";
    return "Mạnh";
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên không được để trống";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự";
    } else if (!/^[\p{L}\s]+$/u.test(formData.fullName.trim())) {
      newErrors.fullName = "Họ tên không được chứa số hoặc ký tự đặc biệt";
    }
    if (!formData.email) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8081/api/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });
      if (!response.ok) {
        let errorMessage = "Đăng ký thất bại";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      alert("Đăng ký thành công!");
      navigate("/login");
    } catch (error) {
      alert(error.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full py-3 pl-12 pr-4 border rounded-xl tracking-wide text-[#5a5478] placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors ${
      errors[field] ? "border-red-500/60 bg-red-500/5" : "border-[#2a2245] bg-[#0f0a1e]"
    }`;

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0b0919] py-8">
      <div className="p-8 bg-[#150f2a] border border-[#2a2245] rounded-lg w-full max-w-md mx-4">

        {/* Header */}
        <div className="mb-8">
          {/* <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-400 text-sm font-medium tracking-widest uppercase">TLUHub</span>
          </div> */}
          <h1 className="mb-2 text-4xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400">Join the TLUHub community today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyen Van A"
                className={inputClass("fullName")}
              />
            </div>
            {errors.fullName && <p className="mt-1.5 text-xs text-red-400">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={inputClass("email")}
              />
            </div>
            {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
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
                  <span className="text-xs text-slate-500">Độ mạnh mật khẩu</span>
                  <span className="text-xs font-medium" style={{ color: getStrengthColor() }}>
                    {getStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-[#2a2245] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${passwordStrength}%`, backgroundColor: getStrengthColor() }}
                  />
                </div>
              </div>
            )}
            {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
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
              I agree to the{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                Privacy Policy
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
                Đang đăng ký...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-white bg-[#150f2a]">Or continue with</span>
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

        {/* Footer */}
        <p className="mt-6 text-center text-slate-400">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;