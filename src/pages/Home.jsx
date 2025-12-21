import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video, LogIn, UserPlus, ArrowRight } from "lucide-react";

function HomePage() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [guestName, setGuestName] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateJoin = () => {
    const newErrors = {};

    if (!roomCode.trim()) {
      newErrors.roomCode = "Vui lòng nhập mã phòng họp";
    } else if (roomCode.length < 6) {
      newErrors.roomCode = "Mã phòng không hợp lệ";
    }

    if (!guestName.trim()) {
      newErrors.guestName = "Vui lòng nhập tên của bạn";
    } else if (guestName.trim().length < 2) {
      newErrors.guestName = "Tên phải có ít nhất 2 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoinMeeting = async () => {
    if (!validateJoin()) return;

    setIsLoading(true);
    try {
      const checkResponse = await fetch(
        `https://kiritsu2210-001-site1.rtempurl.com/api/Meeting/check/${encodeURIComponent(
          roomCode
        )}`
      );
      const checkResult = await checkResponse.json();

      if (!checkResult.data) {
        setErrors({ ...errors, roomCode: "Phòng họp không tồn tại" });
        return;
      }

      const joinResponse = await fetch(
        `https://kiritsu2210-001-site1.rtempurl.com/api/Meeting/${encodeURIComponent(
          roomCode
        )}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userEmail: null,
            guestName: guestName.trim(),
          }),
        }
      );

      const joinResult = await joinResponse.json();
      if (joinResult.returnCode !== 200) {
        setErrors({
          ...errors,
          roomCode: joinResult.message || "Lỗi khi tham gia",
        });
        return;
      }
      sessionStorage.setItem("guestName", guestName.trim());
      sessionStorage.setItem("joinToken", joinResult.data.joinToken);
      navigate(`/meeting/${roomCode}`);
    } catch (error) {
      console.error("Lỗi khi tham gia phòng họp:", error);
      setErrors({ ...errors, roomCode: "Không thể kết nối tới server" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigate("/login", { replace: true });
  };

  const handleRegister = () => {
    navigate("/register", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-[#0B5CFF] p-2 rounded-lg shadow-lg">
                <Video className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                TLU Meeting
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLogin}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium shadow-sm"
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
              <button
                onClick={handleRegister}
                className="flex items-center space-x-2 px-4 py-2 bg-[#0B5CFF] hover:bg-[#0650E0] text-white rounded-lg transition font-medium shadow-lg"
              >
                <UserPlus className="w-5 h-5" />
                <span className="hidden sm:inline">Đăng ký</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Họp trực tuyến
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0B5CFF] to-[#2D7AFF]">
                Đơn giản & Nhanh chóng
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tham gia cuộc họp ngay lập tức với mã phòng, không cần tạo tài
              khoản
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl shadow-xl p-8 md:p-12 mb-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Tham gia cuộc họp
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mã phòng họp
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => {
                      setRoomCode(e.target.value.toUpperCase());
                      if (errors.roomCode)
                        setErrors({ ...errors, roomCode: "" });
                    }}
                    placeholder="VD: MTG-ABC123"
                    className={`w-full px-4 py-4 bg-white border-2 ${
                      errors.roomCode ? "border-red-500" : "border-gray-300"
                    } text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5CFF] focus:border-transparent text-lg font-mono`}
                  />
                  {errors.roomCode && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.roomCode}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên của bạn
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => {
                      setGuestName(e.target.value);
                      if (errors.guestName)
                        setErrors({ ...errors, guestName: "" });
                    }}
                    placeholder="Nhập tên để người khác biết bạn là ai"
                    className={`w-full px-4 py-4 bg-white border-2 ${
                      errors.guestName ? "border-red-500" : "border-gray-300"
                    } text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5CFF] focus:border-transparent text-lg`}
                  />
                  {errors.guestName && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.guestName}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleJoinMeeting}
                  disabled={isLoading}
                  className="w-full py-4 bg-[#0B5CFF] hover:bg-[#0650E0] text-white rounded-xl transition font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>
                    {isLoading ? "Đang kiểm tra..." : "Tham gia ngay"}
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full mt-12 py-6 text-center text-gray-500 text-sm border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <p>
          &copy; 2025 TLU Meeting. Nền tảng họp trực tuyến đơn giản và hiệu quả.
        </p>
      </footer>
    </div>
  );
}

export default HomePage;
