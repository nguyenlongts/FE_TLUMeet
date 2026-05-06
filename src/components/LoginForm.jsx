import { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useLoginUserMutation } from "../redux/features/auth/authApi";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAccessToken,
  setCredentials,
} from "../redux/features/auth/authSlice";
import toast from "react-hot-toast";
const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? "/dashboard";
  const dispatch = useDispatch();
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const accessToken = useSelector(selectAccessToken);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginUser, { isLoading, isSuccess }] = useLoginUserMutation();
  const [loginError, setLoginError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await loginUser({
        email: email,
        password: password,
      }).unwrap();

      dispatch(
        setCredentials({
          user: {
            id: res.data.id,
            email: res.data.email,
            name: res.data.name,
          },
          accessToken: res.data.token,
          refreshToken: res.data.refreshToken,
        }),
      );
      setShouldNavigate(true);
      toast.success("Đăng nhập thành công");
    } catch (error) {
      const msg = error?.data?.message || "Email hoặc mật khẩu không chính xác";
      setLoginError(msg);
    }
  };

  useEffect(() => {
    if (shouldNavigate && accessToken) {
      navigate(from, { replace: true });
    }
  }, [accessToken, shouldNavigate]);
  return (
    <div className="flex items-center justify-center h-screen  bg-[#0b0919]">
      <div className="p-8 bg-[#150f2a] border border-[#2a2245] rounded-lg w-lg">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-white">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full py-3 pl-12 pr-4  border  rounded-xl tracking-widest text-[#5a5478] placeholder-slate-500 focus:border-black"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-white">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full py-3 pl-12 pr-4 border tracking-widest text-[#5a5478]  rounded-xl placeholder-slate-500 focus:border-black "
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 border rounded cursor-pointer bg-slate-700 border-slate-600 accent-blue-500"
              />
              <span className="text-slate-400">Remember me</span>
            </label>
            <a
              href="#"
              className="text-blue-400 transition-colors hover:text-blue-300"
            >
              Forgot Password?
            </a>
          </div>

          {/* Login Error */}
          {loginError && (
            <div className="flex items-start gap-2 p-3 border border-red-500/40 rounded-lg bg-red-500/10">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{loginError}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 font-semibold text-white transition-all duration-300 shadow-lg !bg-gradient-to-r !from-violet-600 !to-purple-500 rounded-xl hover:shadow-blue-500/50 hover:shadow-2xl cursor-pointer  transform hover:scale-105"
          >
            Sign In
          </button>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-white bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                Or continue with
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

        {/* Toggle to Register */}
        <p className="mt-6 text-center text-slate-400">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};
export default LoginForm;
