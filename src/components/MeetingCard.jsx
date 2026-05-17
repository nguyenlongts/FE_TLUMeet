import { useState } from "react";
import {
  Video,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  Users,
  UserPlus,
  Hourglass,
  Crown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import InviteModal from "./InviteModal";
<<<<<<< HEAD
import { UserPlus } from "lucide-react";
import ScheduleMeetingModal from "../pages/meetings/ScheduleMeetingModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
=======
import DeleteConfirmModal from "./DeleteConfirmModal";

>>>>>>> 5dd6b46a2b89b7f59d59b5ba04089c7468aeb427
const AVATAR_COLORS = [
  "from-purple-500 to-violet-600",
  "from-orange-400 to-red-500",
  "from-teal-400 to-cyan-500",
  "from-pink-400 to-rose-500",
];

const formatDate = (dt) => {
  const d = new Date(dt + "Z");
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dt) => {
  const d = new Date(dt + "Z");
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getMeetingState = (meeting) => {
  const { status, scheduledDateTime, duration } = meeting;
  const start = new Date(scheduledDateTime + "Z");
  const end = new Date(start.getTime() + duration * 60_000);
  const now = new Date();

  // Ended hoặc đã quá giờ kết thúc (trừ Live đang chạy)
  if (status === "Ended" || status === 3) return "expired";
  if (status !== "Live" && status !== 2 && now > end) return "expired";

  if (status === "Live" || status === 2) return "live";
  if (status === "WaitingForHost" || status === 1) return "waiting";
  // Scheduled (0) — giữ nguyên "upcoming" dù đang trong giờ
  return "upcoming";
};

const STATUS_CONFIG = {
  live: {
    label: "Live",
    className: "text-emerald-300 bg-emerald-500/15",
    dot: "bg-emerald-400",
    animated: true,
  },
  waiting: {
    label: "Waiting",
    className: "text-amber-300 bg-amber-500/15",
    dot: "bg-amber-400",
    animated: true,
  },
  upcoming: {
    label: "Upcoming",
    className: "text-blue-300 bg-blue-500/15",
    dot: "bg-blue-400",
    animated: false,
  },
  expired: {
    label: "Expired",
    className: "text-white/30 bg-white/5",
    dot: "bg-white/20",
    animated: false,
  },
};

const MeetingCard = ({ meeting, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);

  const state = getMeetingState(meeting);
  const config = STATUS_CONFIG[state];

  const isExpired = state === "expired";

  const canModify = !isExpired && meeting.status !== "started";
  const canJoin = !isExpired;
  const canInvite = !isExpired;

  const handleJoinMeeting = () => {
    navigate(meeting.meetingLink);
  };

  return (
    <div
      className={`rounded-2xl border overflow-hidden flex flex-col transition-transform ${
        isExpired
          ? "border-white/5 opacity-70"
          : "border-white/8 hover:-translate-y-0.5"
      }`}
      style={{ background: "#1e2235" }}
    >
      {/* Top accent bar */}
      <div
        className="h-1 w-full"
        style={{
          background: isExpired
            ? "rgba(255,255,255,0.08)"
            : "linear-gradient(90deg, #a855f7, #7c3aed)",
        }}
      />

      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Title + Status badge */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`text-sm font-medium leading-snug flex-1 ${
              isExpired ? "text-white/40" : "text-white"
            }`}
          >
            {meeting.title}
          </h3>

          {/* Status badge */}
          <span
            className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${config.className}`}
          >
            {config.animated ? (
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}
                />
                <span
                  className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`}
                />
              </span>
            ) : (
              <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            )}
            {config.label}
          </span>
        </div>

        {/* Description */}
        <p
          className={`text-xs leading-relaxed line-clamp-2 ${
            isExpired ? "text-white/25" : "text-white/50"
          }`}
        >
          {meeting.description}
        </p>

        {/* Date / Time / Duration */}
        <div className="flex flex-col gap-1.5 mt-1">
          <div
            className={`flex items-center gap-2 text-xs ${
              isExpired ? "text-white/25" : "text-white/40"
            }`}
          >
            <Calendar
              size={12}
              className={isExpired ? "text-white/20" : "text-purple-400"}
            />
            <span>{formatDate(meeting.scheduledDateTime)}</span>
            <span className="text-white/20">•</span>
            <Clock
              size={12}
              className={isExpired ? "text-white/20" : "text-purple-400"}
            />
            <span>{formatTime(meeting.scheduledDateTime)}</span>
          </div>
          <div
            className={`flex items-center gap-2 text-xs ${
              isExpired ? "text-white/25" : "text-white/40"
            }`}
          >
            <Hourglass
              size={12}
              className={isExpired ? "text-white/20" : "text-purple-400"}
            />
            <span>{meeting.duration} minutes</span>
          </div>
          <div
            className={`flex items-center gap-2 text-xs ${
              isExpired ? "text-white/25" : "text-white/40"
            }`}
          >
            <Crown
              size={12}
              className={isExpired ? "text-white/20" : "text-amber-400"}
            />
            <span className="truncate">{meeting.hostName}</span>
          </div>
        </div>

        {/* Participants */}
        {meeting?.participants?.length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <Users size={12} className="text-white/30" />
            <div className="flex items-center">
              {meeting.participants.slice(0, 3).map((p, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-medium border-2 border-[#1e2235] ${isExpired ? "opacity-40" : ""}`}
                  style={{ marginLeft: i > 0 ? "-6px" : "0" }}
                >
                  {p}
                </div>
              ))}
              {meeting.participants.length > 3 && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white/50 text-xs border-2 border-[#1e2235] -ml-1.5"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  +{meeting.participants.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-white/6" />

      {/* Actions */}
      <div className="flex items-center gap-2 px-5 py-3.5">
        {/* Join button */}
        <button
          onClick={handleJoinMeeting}
          disabled={!canJoin}
          className={`flex-1 py-2 rounded-lg text-xs font-medium text-white flex items-center justify-center gap-1.5 transition-opacity ${
            !canJoin ? "opacity-30 cursor-not-allowed" : ""
          }`}
          style={{
            background: !canJoin
              ? "rgba(255,255,255,0.06)"
              : "linear-gradient(135deg, #a855f7, #7c3aed)",
          }}
          title={isExpired ? "Cuộc họp đã hết hạn" : "Tham gia cuộc họp"}
        >
          <Video size={13} />
          {isExpired
            ? "Expired"
            : state === "waiting"
              ? "Join (Waiting)"
              : "Join Now"}
        </button>

        {/* Invite */}
        <button
          onClick={() => canInvite && setInviteOpen(true)}
          disabled={!canInvite}
          className={`w-8 h-8 rounded-lg flex items-center justify-center border border-white/8 transition-colors ${
            !canInvite
              ? "opacity-20 cursor-not-allowed text-white/30"
              : "text-white/50 hover:text-purple-400 hover:bg-purple-500/10"
          }`}
          title={
            canInvite ? "Mời người tham gia" : "Không thể mời (đã hết hạn)"
          }
        >
          <UserPlus size={13} />
        </button>

        {/* Edit — chỉ hiện khi chưa expired và chưa started */}
        {canModify && (
          <button
            onClick={() => onEdit(meeting)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-purple-400 hover:bg-purple-500/10 transition-colors border border-white/8"
            title="Chỉnh sửa"
          >
            <Pencil size={13} />
          </button>
        )}

        {/* Delete — luôn hiện */}
        <button
          onClick={() => setIsDeleteConfirmModalOpen(true)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-white/8"
          title="Xoá cuộc họp"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Modals */}
      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        roomCode={meeting.roomCode}
      />
      {isDeleteConfirmModalOpen && (
        <DeleteConfirmModal
          isOpen={isDeleteConfirmModalOpen}
          onClose={() => setIsDeleteConfirmModalOpen(false)}
          meetingId={meeting?.id}
        />
      )}
    </div>
  );
};

export default MeetingCard;
