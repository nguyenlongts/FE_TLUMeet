import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useChangePasswordMutation } from "../../redux/features/auth/authApi";
import { logout } from "../../redux/features/auth/authSlice";

function ChangePasswordPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState({ current: false, new: false, confirm: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const err = {};
    if (!formData.currentPassword) err.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    if (!formData.newPassword) err.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (formData.newPassword.length < 6) err.newPassword = "Mật khẩu mới tối thiểu 6 ký tự";
    if (formData.confirmPassword !== formData.newPassword) err.confirmPassword = "Xác nhận mật khẩu không khớp";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }).unwrap();
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      toast.error(err?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-[#1e1a35] border border-[#2a2245] rounded-xl text-white placeholder-[#3d3860] focus:outline-none focus:border-violet-500 transition";

  const fields = [
    { key: "currentPassword", label: "MẬT KHẨU HIỆN TẠI", showKey: "current" },
    { key: "newPassword", label: "MẬT KHẨU MỚI", showKey: "new" },
    { key: "confirmPassword", label: "XÁC NHẬN MẬT KHẨU MỚI", showKey: "confirm" },
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#150f2a] border border-[#2a2245] rounded-2xl p-8">
        <h1 className="text-xl font-semibold text-white mb-1">Đổi mật khẩu</h1>
        <p className="text-sm text-[#5a5478] mb-6">Nhập mật khẩu hiện tại và mật khẩu mới của bạn</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map(({ key, label, showKey }) => (
            <div key={key}>
              <label className="text-[11px] tracking-widest font-medium text-white uppercase">
                {label}
              </label>
              <div className="relative mt-1">
                <input
                  type={show[showKey] ? "text" : "password"}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShow((prev) => ({ ...prev, [showKey]: !prev[showKey] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5478] hover:text-violet-400"
                >
                  {show[showKey] ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
            </div>
          ))}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 bg-gradient-to-r from-violet-600 to-purple-500 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
