import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { User, Phone, MapPin, Calendar, Users, ArrowLeft } from "lucide-react";

function UpdateProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phoneNumber: "",
    address: "",
    birthDate: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("Vui lòng đăng nhập lại");
          navigate("/login");
          return;
        }

        // ⬅️ Copy y hệt Dashboard - CHỈ có Authorization header
        const response = await fetch(
          "https://kiritsu2210-001-site1.rtempurl.com/api/user/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Phiên đăng nhập đã hết hạn");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
            return;
          }
          throw new Error("Không thể lấy thông tin");
        }

        const data = await response.json();

        if (data?.returnCode === 200 && data?.data) {
          const userData = data.data;
          setUserInfo(userData);

          setFormData({
            phoneNumber: userData.phoneNumber || "",
            address: userData.address || "",
            birthDate: userData.birthDate
              ? userData.birthDate.split("T")[0]
              : "",
            gender: userData.gender || "",
          });
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast.error("Không thể kết nối tới server");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Vui lòng đăng nhập lại");
        navigate("/login");
        return;
      }

      // PUT request CẦN Content-Type
      const response = await fetch(
        "https://kiritsu2210-001-site1.rtempurl.com/api/user/profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        throw new Error("Cập nhật thất bại");
      }

      const data = await response.json();

      if (data?.returnCode === 200 && data?.data) {
        toast.success(data.message || "Cập nhật thành công");

        const userData = data.data;
        setUserInfo(userData);

        setFormData({
          phoneNumber: userData.phoneNumber || "",
          address: userData.address || "",
          birthDate: userData.birthDate ? userData.birthDate.split("T")[0] : "",
          gender: userData.gender || "",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition group mb-4"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Thông tin cá nhân
          </h1>
          <p className="text-gray-600 mt-2">
            Cập nhật thông tin cá nhân của bạn
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {userInfo && (
            <div className="bg-indigo-600 p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{userInfo.name}</h2>
                  <p className="text-indigo-100">{userInfo.email}</p>
                  <span className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium mt-2">
                    {userInfo.role || "User"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Số điện thoại</span>
                </div>
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Địa chỉ</span>
                </div>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Ngày sinh</span>
                </div>
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Giới tính</span>
                </div>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition bg-white"
              >
                <option value="">Chọn giới tính</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold shadow-lg hover:shadow-xl"
              >
                {loading ? "Đang xử lý..." : "Cập nhật thông tin"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateProfile;
