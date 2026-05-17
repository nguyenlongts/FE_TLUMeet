import { Video, Plus, ArrowRight } from "lucide-react";
import MeetingCard from "../../components/MeetingCard";
import StatCard from "../../components/StatCard";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { useEffect, useMemo, useState } from "react";
import {
  useDeleteMeetingApiMutation,
  useGetAllMeetingByEmailQuery,
  useGetInvitedMeetingsQuery,
  useJoinMeetingMutation,
  useLazyCheckRoomCodeQuery,
} from "../../redux/features/meetings/meetingsApi";
import ScheduleMeetingModal from "../meetings/ScheduleMeetingModal";
import { Form, Input, Button } from "antd";
import WaitingRoom from "../meetings/WaitingRoom";
import { useNavigate } from "react-router-dom";

const parseUtc = (dateStr) => new Date(dateStr + "Z");

const isSameDay = (d1, d2) =>
  d1.toLocaleDateString() === d2.toLocaleDateString();

const getMeetingState = (meeting) => {
  const { status, scheduledDateTime, duration } = meeting;
  const start = parseUtc(scheduledDateTime);
  const end = new Date(start.getTime() + duration * 60_000);
  const now = new Date();

  if (status === "Ended" || status === 3) return "expired";
  if (status !== "Live" && status !== 2 && now > end) return "expired";

  if (status === "Live" || status === 2) return "live";
  if (status === "WaitingForHost" || status === 1) return "waiting";
  return "upcoming";
};

const JoinLinkModal = ({ isOpen, onClose, pushRoomCode, handleWaiting }) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector(selectCurrentUser);
  const [checkRoomCode] = useLazyCheckRoomCodeQuery();
  const [joinMeeting, { error }] = useJoinMeetingMutation();

  const handleSubmit = async ({ roomCode }) => {
    setIsLoading(true);
    handleWaiting();
    try {
      const resCheckRoomCode = await checkRoomCode(roomCode).unwrap();
      if (!resCheckRoomCode?.statusCode === 200 || !resCheckRoomCode) {
        form.setFields([
          { name: "roomCode", errors: ["Phòng họp không tồn tại"] },
        ]);
        return;
      }
      const formJoin = {
        roomCode,
        userEmail: user.email,
        guestName: user.name,
      };
      const res = await joinMeeting(formJoin).unwrap();
      if (!error) onClose();
      sessionStorage.setItem("joinToken", res?.data?.joinToken);
      pushRoomCode(roomCode);
    } catch (err) {
      form.setFields([
        {
          name: "roomCode",
          errors: [err?.data?.message || "Không thể kết nối tới server"],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-4 bg-[#1a1d2e] border border-white/10 rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">
            Tham gia phòng họp
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            label={
              <span className="text-[11px] tracking-widest text-[#5a5478] font-medium">
                MÃ PHÒNG HỌP
              </span>
            }
            name="roomCode"
            rules={[
              { required: true, message: "Vui lòng nhập mã phòng họp" },
              { min: 6, message: "Mã phòng không hợp lệ" },
            ]}
            normalize={(val) => val.toUpperCase()}
          >
            <Input placeholder="VD: MTG-ABC123" className="!font-mono" />
          </Form.Item>

          <Form.Item className="!mb-0 !mt-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              className="!h-11 !rounded-xl !font-medium !text-sm !bg-gradient-to-r !from-violet-600 !to-purple-500 !border-0 group"
              icon={
                !isLoading && (
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )
              }
              iconPosition="end"
            >
              {isLoading ? "Đang kiểm tra..." : "Tham gia ngay"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  const { data: meetingsRaw } = useGetAllMeetingByEmailQuery(user?.email);
  const { data: invitedRaw } = useGetInvitedMeetingsQuery();

  const meetings = useMemo(() => {
    const hosted = meetingsRaw?.data || [];
    const invited = invitedRaw?.data || [];
    const map = new Map();
    [...hosted, ...invited].forEach((m) => map.set(m.id, m));
    return Array.from(map.values());
  }, [meetingsRaw, invitedRaw]);

  const recentMeetings = useMemo(
    () =>
      [...meetings]
        .sort(
          (a, b) =>
            parseUtc(b.scheduledDateTime) - parseUtc(a.scheduledDateTime),
        )
        .slice(0, 6),
    [meetings],
  );

  const now = new Date();

  const todayMeetings = meetings.filter((m) =>
    isSameDay(parseUtc(m.scheduledDateTime), now),
  );

  const upcomingToday = todayMeetings
    .filter((m) => getMeetingState(m) === "upcoming")
    .sort(
      (a, b) => parseUtc(a.scheduledDateTime) - parseUtc(b.scheduledDateTime),
    );

  let timeLeftText = "No upcoming meetings today";

  const nextMeeting = upcomingToday[0];

  if (nextMeeting) {
    const diffMs = parseUtc(nextMeeting.scheduledDateTime) - now;

    if (diffMs > 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);

      timeLeftText =
        diffHours > 0
          ? `Next meeting in ${diffHours}h ${diffMinutes}m`
          : `Next meeting in ${diffMinutes}m`;
    }
  }

  const totalMeetings = meetings.length;
  const expiredMeetings = meetings.filter(
    (m) => getMeetingState(m) === "expired",
  ).length;
  const liveMeetings = meetings.filter(
    (m) => getMeetingState(m) === "live" || getMeetingState(m) === "waiting",
  ).length;

  const [type, setType] = useState("");
  const [isScheduleMeetingModalOpen, setIsScheduleMeetingModalOpen] =
    useState(false);
  const [isJoinLinkModalOpen, setIsJoinLinkModalOpen] = useState(false);
  const [isWaitingRoomOpen, setIsWaitingRoomOpen] = useState(false);
  const [roomCode, setRoomCode] = useState();
  const [editMeeting, setEditMeeting] = useState();

  const handleJoinLink = () => setIsJoinLinkModalOpen(true);

  const onHostJoined = () => {
    setIsWaitingRoomOpen(false);
    navigate(`/meet/${roomCode}`);
  };

  const handleEdit = (meeting) => {
    setEditMeeting(meeting);
    setType("edit");
    setIsScheduleMeetingModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-white">Meetings</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <StatCard
            icon="🟣"
            label="Total meetings"
            value={totalMeetings}
            subtext="All time"
            color="from-purple-500 to-violet-600"
          />
          <StatCard
            icon="🟢"
            label="Live / Waiting"
            value={liveMeetings}
            subtext="Right now"
            color="from-emerald-400 to-teal-500"
          />
          <StatCard
            icon="🔴"
            label="Expired meetings"
            value={expiredMeetings}
            subtext="All time"
            color="from-red-500 to-pink-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <button
            onClick={() => {
              setType("now");
              setIsScheduleMeetingModalOpen(true);
            }}
            className="flex items-center gap-3 px-6 py-4 font-semibold text-white transition-all transform bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 rounded-2xl hover:scale-105"
          >
            <Video className="w-6 h-6" />
            <div className="text-left">
              <div>New Meeting</div>
              <div className="text-xs font-normal text-purple-100">
                Start New Meeting
              </div>
            </div>
          </button>

          <button
            onClick={handleJoinLink}
            className="flex items-center gap-3 px-6 py-4 font-semibold text-white transition-all border border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 rounded-2xl"
          >
            <Plus className="w-6 h-6" />
            <div className="text-left">
              <div>Join Meeting</div>
              <div className="text-xs font-normal text-slate-400">
                Via Room Code
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setIsScheduleMeetingModalOpen(true);
              setType("schedule");
            }}
            className="flex items-center gap-3 px-6 py-4 font-semibold text-white transition-all border border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 rounded-2xl"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-2.3-3.04c-.3-.4-.94-.5-1.42-.1-.48.4-.51 1.04-.1 1.42l3 4c.2.28.53.44.88.44.35 0 .68-.16.88-.44l3.85-5.15c.41-.54.34-1.3-.1-1.42-.44-.12-1.11.05-1.42.45z" />
            </svg>
            <div className="text-left">
              <div>Schedule Meeting</div>
              <div className="text-xs font-normal text-slate-400">
                Plan Your Meeting
              </div>
            </div>
          </button>
        </div>

        {/* Today summary */}
        <div className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-white">
            You have {todayMeetings.length} meeting
            {todayMeetings.length !== 1 ? "s" : ""} today
          </h2>
          <p className="text-sm text-slate-400">{timeLeftText}</p>
        </div>

        {/* Meetings Grid */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Meetings</h2>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {recentMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onEdit={handleEdit}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {isScheduleMeetingModalOpen && (
        <ScheduleMeetingModal
          isOpen={isScheduleMeetingModalOpen}
          onClose={() => setIsScheduleMeetingModalOpen(false)}
          hostEmail={user?.email}
          type={type}
          meeting={editMeeting}
        />
      )}
      {isJoinLinkModalOpen && (
        <JoinLinkModal
          isOpen={isJoinLinkModalOpen}
          onClose={() => setIsJoinLinkModalOpen(false)}
          handleWaiting={() => setIsWaitingRoomOpen(true)}
          pushRoomCode={(rc) => setRoomCode(rc)}
        />
      )}
      {isWaitingRoomOpen && (
        <WaitingRoom
          roomCode={roomCode}
          userName={user.name}
          onCancel={() => setIsWaitingRoomOpen(false)}
          onHostJoined={onHostJoined}
        />
      )}
    </div>
  );
};

export default Dashboard;
