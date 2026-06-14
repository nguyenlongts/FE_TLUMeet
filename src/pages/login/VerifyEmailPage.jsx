import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import toast from "react-hot-toast";
import {
  useVerifyEmailMutation,
  useResendVerificationMutation,
} from "../../redux/features/auth/authApi";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  // status: 'verifying' | 'success' | 'error'
  const [status, setStatus] = useState(token ? "verifying" : "error");
  const [message, setMessage] = useState(
    token ? "" : "Liên kết xác thực không hợp lệ.",
  );
  const [email, setEmail] = useState("");

  const [verifyEmail] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: resending }] =
    useResendVerificationMutation();
  const ran = useRef(false);

  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true; // tránh gọi 2 lần do StrictMode
    (async () => {
      try {
        const res = await verifyEmail(token).unwrap();
        setStatus("success");
        setMessage(res?.message || "Xác thực email thành công");
      } catch (err) {
        setStatus("error");
        setMessage(
          err?.data?.message || "Token không hợp lệ hoặc đã hết hạn.",
        );
      }
    })();
  }, [token, verifyEmail]);

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }
    try {
      const res = await resendVerification(email.trim()).unwrap();
      toast.success(res?.message || "Đã gửi lại email xác thực");
    } catch (err) {
      toast.error(err?.data?.message || "Không thể gửi lại email");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg)] p-4">
      <div className="w-full max-w-md p-8 bg-[var(--surface)] border border-[var(--line)] rounded-2xl text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-[var(--accent-fg)]" />
            <h1 className="text-xl font-semibold text-[var(--content)]">
              Đang xác thực email…
            </h1>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-14 h-14 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl font-bold text-[var(--content)] mb-2">
              Xác thực thành công
            </h1>
            <p className="text-[var(--muted)] mb-6">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 font-semibold text-white rounded-xl bg-[var(--accent)] hover:opacity-90 transition"
            >
              Đăng nhập
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-14 h-14 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-[var(--content)] mb-2">
              Xác thực thất bại
            </h1>
            <p className="text-[var(--muted)] mb-6">{message}</p>

            <div className="text-left">
              <label className="block mb-2 text-sm font-medium text-[var(--content)]">
                Gửi lại email xác thực
              </label>
              <div className="relative mb-3">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-[var(--faint)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="w-full py-3 pl-12 pr-4 border rounded-xl text-[var(--faint)] placeholder:text-[var(--muted)] border-[var(--line)] bg-[var(--bg)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <button
                onClick={handleResend}
                disabled={resending}
                className="w-full py-3 font-semibold text-white rounded-xl bg-[var(--accent)] hover:opacity-90 transition disabled:opacity-60"
              >
                {resending ? "Đang gửi…" : "Gửi lại email xác thực"}
              </button>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="mt-4 text-sm text-blue-400 hover:text-blue-300"
            >
              Quay lại đăng nhập
            </button>
          </>
        )}
      </div>
    </div>
  );
}
