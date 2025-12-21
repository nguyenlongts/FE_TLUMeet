import React, { useState, useEffect } from "react";
import EditMeetingModal from "./EditMeetingModal";
import WaitingRoom from "./WaitingRoom";
import UpdateProfile from "./UpdateProfile";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "./DashboardHeader";
import { useAuth } from "../context/AuthContext";
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  Eye,
  Trash2,
  Copy,
  Lock,
  Play,
  ArrowRight,
  LogOut,
  Crown,
  Check,
} from "lucide-react";

function DashboardPage() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [waitingRoomData, setWaitingRoomData] = useState(null);
  const [quickJoinCode, setQuickJoinCode] = useState("");
  const [quickJoinError, setQuickJoinError] = useState("");

  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [completedMeetings, setCompletedMeetings] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");

  const [stats, setStats] = useState({
    totalMeetings: 0,
    upcomingMeetings: 0,
    totalParticipants: 0,
    avgDuration: "0h",
  });

  const formatDuration = (duration) => {
    if (!duration || duration === 0) return "0 phút";
    const h = Math.floor(duration / 60);
    const m = duration % 60;
    return `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m" : ""}`;
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch(
          `https://kiritsu2210-001-site1.rtempurl.com/api/Meeting/by-email?email=${user.email}`
        );
        const data = await response.json();
        if (!data.data) return;

        const upcoming = [];
        const completed = [];
        let totalParticipants = 0;
        let totalDuration = 0;

        data.data.forEach((m) => {
          // Tạo datetime đầy đủ từ scheduledDate + scheduledTime
          let meetingDate = new Date(m.scheduledDate);
          if (m.scheduledTime) {
            const [hours, minutes] = m.scheduledTime.split(":").map(Number);
            meetingDate.setHours(hours, minutes, 0, 0);
          }

          const now = new Date();
          const status = meetingDate > now ? "upcoming" : "completed";

          const meeting = {
            id: m.id,
            title: m.title,
            description: m.description,
            roomCode: m.roomCode,
            hostName: m.hostName,
            isPasswordProtected: m.isPasswordProtected,
            scheduledDateRaw: m.scheduledDate,
            scheduledTimeRaw: m.scheduledTime,
            durationRaw: m.duration,
            date: meetingDate.toLocaleDateString(),
            time:
              m.scheduledTime ||
              meetingDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            duration: formatDuration(m.duration),
            participants: m.participants || 0,
            status: status,
          };

          totalParticipants += meeting.participants;
          totalDuration += m.duration || 0;

          if (status === "upcoming") upcoming.push(meeting);
          else completed.push(meeting);
        });

        setUpcomingMeetings(upcoming);
        setCompletedMeetings(completed);
        setStats({
          totalMeetings: data.data.length,
          upcomingMeetings: upcoming.length,
          totalParticipants,
          avgDuration: formatDuration(
            Math.floor(totalDuration / data.data.length)
          ),
        });
      } catch (error) {
        console.error(error);
      }
    };

    fetchMeetings();
  }, [user.email]);

  const validateJoin = () => {
    if (!quickJoinCode.trim()) {
      setQuickJoinError("Vui lòng nhập mã phòng họp");
      return false;
    } else if (quickJoinCode.length < 6) {
      setQuickJoinError("Mã phòng không hợp lệ");
      return false;
    }
    setQuickJoinError("");
    return true;
  };

  const handleQuickJoin = async () => {
    if (!validateJoin()) return;

    try {
      setQuickJoinError("");
      const res = await fetch(
        `https://kiritsu2210-001-site1.rtempurl.com/api/Meeting/check/${quickJoinCode}`
      );
      const data = await res.json();
      if (data.data === false) {
        setQuickJoinError("Mã phòng không tồn tại");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vui lòng đăng nhập lại.");
        navigate("/login");
        return;
      }

      const statusRes = await fetch(
        `https://kiritsu2210-001-site1.rtempurl.com/api/Meeting/${quickJoinCode}/status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const statusData = await statusRes.json();
      const isHost = statusData.data.hostName === user.email;

      if (
        isHost &&
        statusData.data.requireHostToStart &&
        !statusData.data.isStarted
      ) {
        await fetch(
          `https://kiritsu2210-001-site1.rtempurl.com/api/Meeting/${quickJoinCode}/start`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        navigate(`/meeting/${quickJoinCode}`);
      } else if (!statusData.data.canJoin) {
        setWaitingRoomData({
          roomCode: quickJoinCode,
          userName: user.name || user.email,
        });
        setShowWaitingRoom(true);
      } else {
        navigate(`/meeting/${quickJoinCode}`);
      }
    } catch (error) {
      console.error(error);
      setQuickJoinError("Không thể tham gia cuộc họp. Vui lòng thử lại.");
    }
  };

  const handleCopyRoomCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã copy mã phòng: ${code}`);
  };

  const handleDeleteMeeting = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa cuộc họp này?")) return;

    try {
      const response = await fetch(
        `https://kiritsu2210-001-site1.rtempurl.com/api/Meeting/${id}`,
        {
          method: "DELETE",
        }
      );
      const result = await response.json();

      if (result.data) {
        const resMeetings = await fetch(
          `https://kiritsu2210-001-site1.rtempurl.com/api/Meeting/by-email?email=${user.email}`
        );
        const dataMeetings = await resMeetings.json();

        if (!dataMeetings.data) return;

        const upcoming = [];
        const completed = [];

        dataMeetings.data.forEach((m) => {
          const scheduledDate = new Date(m.scheduledDate);
          const now = new Date();
          const meeting = {
            id: m.id,
            title: m.title,
            date: scheduledDate.toLocaleDateString(),
            time:
              m.scheduledTime ||
              scheduledDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            duration: formatDuration(m.duration),
            participants: m.participants || 0,
            status: scheduledDate > now ? "upcoming" : "completed",
            roomCode: m.roomCode,
            isPasswordProtected: m.isPasswordProtected,
            hostName: m.hostName,
          };

          if (meeting.status === "upcoming") upcoming.push(meeting);
          else completed.push(meeting);
        });

        setUpcomingMeetings(upcoming);
        setCompletedMeetings(completed);

        alert("Xóa phòng họp thành công!");
      } else {
        alert("Xóa thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleJoinMeeting = async (meeting) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vui lòng đăng nhập lại.");
        navigate("/login");
        return;
      }

      const res = await fetch(
        `https://kiritsu2210-001-site1.rtempurl.com/api/Meeting/${meeting.roomCode}/status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (data.returnCode !== 200) {
        alert("Không thể lấy trạng thái phòng họp.");
        return;
      }

      const roomStatus = data.data;
      const isHost = roomStatus.hostName === user.email;

      if (isHost && roomStatus.requireHostToStart && !roomStatus.isStarted) {
        const startRes = await fetch(
          `https://kiritsu2210-001-site1.rtempurl.com/api/Meeting/${meeting.roomCode}/start`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!startRes.ok) throw new Error("Không thể bắt đầu phòng họp.");
      }

      navigate(`/meeting/${meeting.roomCode}`);
    } catch (error) {
      console.error(error);
      alert("Không thể tham gia cuộc họp.");
    }
  };

  const MeetingCard = ({ meeting, type }) => {
    const isHost = meeting.hostName === user.email;

    return (
      <div key={meeting.id} className="p-6 hover:bg-gray-50 transition">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {meeting.title}
              </h3>
              {isHost && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  <Crown className="w-3 h-3" />
                  <span>Host</span>
                </div>
              )}
              {meeting.isPasswordProtected && (
                <Lock className="w-4 h-4 text-yellow-600" />
              )}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  meeting.status === "upcoming"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {meeting.status === "upcoming"
                  ? "Sắp diễn ra"
                  : "Đã hoàn thành"}
              </span>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{meeting.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>
                  {meeting.time} ({meeting.duration})
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{meeting.participants} người</span>
              </div>
            </div>

            <div className="mt-3 flex items-center space-x-2">
              <code className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-mono">
                {meeting.roomCode}
              </code>
              <button
                onClick={() => handleCopyRoomCode(meeting.roomCode)}
                className="p-1 text-gray-500 hover:text-indigo-600 transition"
                title="Copy mã phòng"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {meeting.status === "upcoming" && (
              <button
                onClick={() => handleJoinMeeting(meeting)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition font-medium ${
                  isHost
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isHost ? (
                  <>
                    <Crown className="w-4 h-4" />
                    <span>Bắt đầu (Host)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Tham gia</span>
                  </>
                )}
              </button>
            )}
            {isHost && meeting.status === "upcoming" && (
              <button
                onClick={() => {
                  setEditingMeeting(meeting);
                  setShowEditModal(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium"
              >
                <span>Sửa</span>
              </button>
            )}
            {isHost && (
              <button
                onClick={() => handleDeleteMeeting(meeting.id)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMeetings = () => {
    const list =
      activeTab === "upcoming" ? upcomingMeetings : completedMeetings;
    if (list.length === 0) {
      return (
        <div className="p-12 text-center">
          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Không có cuộc họp nào</p>
          <p className="text-gray-400 text-sm mt-2">
            {activeTab === "upcoming"
              ? "Tạo phòng họp mới để bắt đầu"
              : "Các cuộc họp đã hoàn thành sẽ hiển thị ở đây"}
          </p>
        </div>
      );
    }
    return list.map((m) => (
      <MeetingCard key={m.id} meeting={m} type={activeTab} />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Waiting Room Component */}
      {showWaitingRoom && waitingRoomData && (
        <WaitingRoom
          roomCode={waitingRoomData.roomCode}
          userName={waitingRoomData.userName}
          onHostJoined={() => {
            setShowWaitingRoom(false);
            navigate(`/meeting/${waitingRoomData.roomCode}`);
          }}
          onCancel={() => {
            setShowWaitingRoom(false);
            setWaitingRoomData(null);
          }}
        />
      )}

      <DashboardHeader></DashboardHeader>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Join - No Gradient */}
        <div className="bg-indigo-600 rounded-2xl shadow-xl p-8 mb-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">
              Tham gia nhanh
            </h2>
            <p className="text-indigo-100 mb-6">
              Nhập mã phòng để tham gia cuộc họp ngay lập tức
            </p>
            <div className="flex space-x-3">
              <input
                type="text"
                value={quickJoinCode}
                onChange={(e) => setQuickJoinCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === "Enter" && handleQuickJoin()}
                placeholder="Nhập mã phòng (VD: MTG-ABC123)"
                className="flex-1 px-4 py-3 rounded-lg border-2 border-indigo-400 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white font-mono text-lg"
              />
              <button
                onClick={handleQuickJoin}
                className="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center space-x-2 whitespace-nowrap"
              >
                <span>Tham gia</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            {quickJoinError && (
              <p className="mt-2 text-sm text-yellow-200">{quickJoinError}</p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng cuộc họp</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalMeetings}
                </p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Video className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sắp diễn ra</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.upcomingMeetings}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">Trong 7 ngày tới</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Thời lượng TB</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.avgDuration}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">Mỗi cuộc họp</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`flex-1 py-4 text-center font-medium transition ${
                activeTab === "upcoming"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Sắp diễn ra</span>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs">
                  {upcomingMeetings.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`flex-1 py-4 text-center font-medium transition ${
                activeTab === "completed"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-5 h-5" />
                <span>Đã hoàn thành</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {completedMeetings.length}
                </span>
              </div>
            </button>
          </div>
          <div className="divide-y divide-gray-200">{renderMeetings()}</div>
        </div>

        {showEditModal && editingMeeting && (
          <EditMeetingModal
            meeting={editingMeeting}
            onClose={() => {
              setShowEditModal(false);
              setEditingMeeting(null);
            }}
            onUpdated={() => window.location.reload()}
          />
        )}
        {showProfileModal && (
          <UpdateProfile
            user={user}
            onClose={() => setShowProfileModal(false)}
            onUpdated={(updatedUser) => window.location.reload()}
          />
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
