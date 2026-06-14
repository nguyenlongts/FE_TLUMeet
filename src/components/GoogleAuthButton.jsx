import { GoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useGoogleLoginMutation } from "../redux/features/auth/authApi";
import { setCredentials } from "../redux/features/auth/authSlice";

// Nút đăng nhập Google. Google Identity Services trả về ID token (credential),
// gửi lên backend /Auth/google để xác thực rồi nhận JWT + refresh token của app.
export default function GoogleAuthButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const from = location.state?.from?.pathname ?? "/dashboard";
  const [googleLogin] = useGoogleLoginMutation();

  const handleSuccess = async (cred) => {
    try {
      const res = await googleLogin({ idToken: cred.credential }).unwrap();

      // Giải mã JWT để lấy role (giống luồng đăng nhập thường)
      const payload = JSON.parse(atob(res.data.token.split(".")[1]));
      const roles = (payload.roles ?? [payload.role ?? payload.Role])
        .filter(Boolean)
        .map((r) => r.toString().trim().toLowerCase());
      const isAdmin = roles.some((r) => r.includes("admin"));

      dispatch(
        setCredentials({
          user: {
            id: res.data.id,
            email: res.data.email,
            name: res.data.name,
            roles,
          },
          accessToken: res.data.token,
          refreshToken: res.data.refreshToken,
        })
      );

      toast.success(res.message);
      navigate(isAdmin ? "/admin" : from, { replace: true });
    } catch (error) {
      toast.error(error?.data?.message || t("login.toast.loginError"), {
        position: "top-center",
      });
    }
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error(t("login.toast.loginError"))}
        theme="outline"
        size="large"
        locale={i18n.language}
        text="continue_with"
      />
    </div>
  );
}
