import React, { useState } from "react";
import {
  Video,
  Calendar,
  Clock,
  Users,
  Lock,
  Link,
  Settings,
  Copy,
  Check,
  AlertCircle,
  Shield,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";

function CreateMeeting() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: "60",
    maxParticipants: "",
    isPasswordProtected: false,
    password: "",
    requireHostToStart: true,
    allowGuestJoin: true,
    enableWaitingRoom: false,
    enableRecording: false,
    muteParticipantsOnEntry: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề không được để trống";
    }

    if (formData.scheduledDate) {
      const selectedDate = new Date(formData.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.scheduledDate = "Ngày họp không được là ngày trong quá khứ";
      }
    }

    if (formData.isPasswordProtected && !formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.isPasswordProtected && formData.password.length < 4) {
      newErrors.password = "Mật khẩu phải có ít nhất 4 ký tự";
    }

    if (formData.maxParticipants && formData.maxParticipants < 2) {
      newErrors.maxParticipants = "Số người tham gia tối thiểu là 2";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const payload = {
        title: formData.title,
        description: formData.description,
        hostName: user.email || "Host",
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        duration: Number(formData.duration),
        isPasswordProtected: formData.isPasswordProtected,
        password: formData.isPasswordProtected ? formData.password : "",
      };

      const response = await fetch("http://localhost:5110/api/Meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.returnCode === 200) {
        setCreatedMeeting(result.data);
        setShowSuccess(true);
      } else {
        alert("Tạo phòng họp thất bại: " + result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Đã có lỗi xảy ra khi tạo phòng họp");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = (link, type) => {
    navigator.clipboard.writeText(link);
    alert(`Đã copy ${type === "host" ? "link Host" : "link Meeting"}!`);
  };

  const handleStartMeeting = () => {
    if (createdMeeting) {
      window.location.href = createdMeeting.hostJoinLink;
    }
  };

  if (showSuccess && createdMeeting) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-2">
                Phòng họp đã được tạo!
              </h2>
              <p className="text-green-100">Bạn là Host của phòng họp này</p>
            </div>

            <div className="p-8 space-y-6">
              {/* Thông tin cơ bản */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {createdMeeting.title}
                </h3>
                {createdMeeting.description && (
                  <p className="text-gray-600 mb-2">
                    {createdMeeting.description}
                  </p>
                )}
                <p className="text-gray-700">
                  <span className="font-semibold">Ngày họp:</span>{" "}
                  {new Date(createdMeeting.scheduledDate).toLocaleDateString()}{" "}
                  {createdMeeting.scheduledTime}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Thời lượng:</span>{" "}
                  {createdMeeting.duration} phút
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Bảo vệ mật khẩu:</span>{" "}
                  {createdMeeting.isPasswordProtected ? "Có" : "Không"}
                </p>
                {createdMeeting.isPasswordProtected && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Mật khẩu:</span>{" "}
                    {createdMeeting.password}
                  </p>
                )}
              </div>

              {/* Mã phòng họp */}
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-600 font-medium mb-1">
                      Mã phòng họp
                    </p>
                    <code className="text-3xl font-bold text-indigo-900">
                      {createdMeeting.roomCode}
                    </code>
                  </div>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(createdMeeting.roomCode)
                    }
                    className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Copy className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Link Meeting */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Link className="w-4 h-4 mr-2 text-indigo-600" />
                  Link Meeting
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={createdMeeting.meetingLink}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(createdMeeting.meetingLink)
                    }
                    className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
                  >
                    <Copy className="w-5 h-5" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Button hành động */}
              <div className="flex space-x-4">
                <button
                  onClick={() =>
                    (window.location.href = createdMeeting.hostJoinLink)
                  }
                  className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-semibold flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Video className="w-5 h-5" />
                  <span>Bắt đầu họp ngay (Host)</span>
                </button>
                <button
                  onClick={() => (window.location.href = "/dashboard")}
                  className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Về Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tạo phòng họp mới
            </h1>
            <p className="text-gray-600">
              Điền thông tin để tạo phòng họp. Bạn sẽ là Host của phòng này.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề cuộc họp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="VD: Họp team Marketing tháng 10"
                className={`w-full px-4 py-3 border ${
                  errors.title ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Mô tả ngắn về nội dung cuộc họp..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Ngày họp
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${
                    errors.scheduledDate ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {errors.scheduledDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.scheduledDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Giờ bắt đầu
                </label>
                <input
                  type="time"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Duration & Max Participants */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời lượng (phút)
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="30">30 phút</option>
                  <option value="60">1 giờ</option>
                  <option value="90">1.5 giờ</option>
                  <option value="120">2 giờ</option>
                  <option value="180">3 giờ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Số người tối đa
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  placeholder="Không giới hạn"
                  min="2"
                  className={`w-full px-4 py-3 border ${
                    errors.maxParticipants
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {errors.maxParticipants && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.maxParticipants}
                  </p>
                )}
              </div>
            </div>

            {/* Password Protection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isPasswordProtected"
                    checked={formData.isPasswordProtected}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Bảo vệ bằng mật khẩu
                  </span>
                </label>
              </div>

              {formData.isPasswordProtected && (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu (tối thiểu 4 ký tự)"
                    className={`w-full px-4 py-3 pr-12 border ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-6">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`flex-1 py-4 rounded-lg font-semibold transition flex items-center justify-center space-x-2 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Tạo phòng họp</span>
                  </>
                )}
              </button>
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateMeeting;
