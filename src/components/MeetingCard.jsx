// import { useState } from "react";
// import {
//   Search,
//   Video,
//   Calendar,
//   Clock,
//   Pencil,
//   Trash2,
//   Plus,
//   Users,
//   Edit,
// } from "lucide-react";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import WaitingRoom from "../pages/meetings/WaitingRoom";
// import InviteModal from "./InviteModal";
// import { UserPlus } from "lucide-react";
// import ScheduleMeetingModal from "../pages/meetings/ScheduleMeetingModal";
// import DeleteConfirmModal from "./DeleteConfirmModal";
// const AVATAR_COLORS = [
//   "from-[var(--accent)] to-[var(--accent)]",
//   "from-orange-400 to-red-500",
//   "from-teal-400 to-cyan-500",
//   "from-pink-400 to-rose-500",
// ];

// const formatDate = (dt) => {
//   const d = new Date(dt);
//   return d.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// const formatTime = (dt) => {
//   const d = new Date(dt);
//   return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
// };
// const MeetingCard = ({ meeting, onDelete }) => {
//   console.log(meeting)
//   const navigate=useNavigate()
//   const user=useSelector((state)=>state.auth.user)
//   const [isEdit,setIsEdit]=useState(false)
//   const [isDeleteConfirmModalOpen,setIsDeleteConfirmModalOpen]=useState(false)
//   const handleDelete=()=>{
//     setIsDeleteConfirmModalOpen(true)
//   }
//   const [inviteOpen, setInviteOpen] = useState(false);

//   const handleJoinMeeting = () => {
//     navigate(`${meeting.meetingLink}`);
//   };
//   const canModify = meeting.status !== "started";
//   const statusColor = {
//     Scheduled: "text-[var(--accent-fg)] bg-[var(--accent)]/15",
//     Live: "text-emerald-300 bg-emerald-500/15",
//     Ended: "text-red-300 bg-red-500/15",
//     WaitingForHost: "text-yellow-300 bg-yellow-500/15",
//   };
//   const onEdit = () => {
//     setIsEdit(true);
//   }
//   return (  
//     <div
//       className="rounded-2xl border border-[var(--line)] overflow-hidden flex flex-col transition-transform
//        hover:-translate-y-0.5"
//       style={{ background: "var(--surface)" }}
//     >
//       <div
//         className="h-1 w-full"
//         style={{
//           background:
//             meeting.hostName === user?.email
//               ? "linear-gradient(90deg, #a855f7, #7c3aed)"
//               : "linear-gradient(90deg, #60a5fa, #60a5fa)",
//         }}
//       />

//       <div className="flex flex-col gap-3 p-5 flex-1">
//         {/* Title + Status */}
//         <div className="flex items-start justify-between gap-2">
//           <h3 className="text-[var(--content)] text-sm font-medium leading-snug flex-1">
//             {meeting.title}
//           </h3>
//           <span
//             className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
//               statusColor[meeting.status] || "text-[var(--content)]/50 bg-[var(--overlay)]"
//             }`}
//           >
//             {meeting.status.toUpperCase()}
//           </span>
//         </div>

//         {/* Description */}
//         <p className="text-[var(--content)]/50 text-xs leading-relaxed line-clamp-2">
//           {meeting.description}
//         </p>

//         {/* Meta */}
//         <div className="flex flex-col gap-1.5 mt-1">
//           <div className="flex items-center gap-2 text-[var(--content)]/40 text-xs">
//             <Calendar size={12} className="text-cyan-400" />
//             <span>{formatDate(meeting.scheduledDateTime)}</span>
//             <span className="text-[var(--content)]/20">•</span>
//             <Clock size={12} className="text-cyan-400" />
//             <span>{formatTime(meeting.scheduledDateTime)}</span>
//           </div>
//           <div className="flex items-center gap-2 text-[var(--content)]/40 text-xs">
//             <Clock size={12} className="text-cyan-400" />
//             <span>{meeting.duration} minutes</span>
//           </div>
//         </div>

//         {/* Participants */}
//         {/* <div className="flex items-center gap-2 mt-1">
//           <Users size={12} className="text-[var(--content)]/30" />
//           <div className="flex items-center">
//             {meeting?.participants?.slice(0, 3).map((p, i) => (
//               <div
//                 key={i}
//                 className={`w-6 h-6 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-[var(--content)] text-xs font-medium border-2 border-[var(--surface)]`}
//                 style={{ marginLeft: i > 0 ? "-6px" : "0" }}
//               >
//                 {p}
//               </div>
//             ))}
//             {meeting?.participants?.length > 3 && (
//               <div
//                 className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--content)]/50 text-xs border-2 border-[var(--surface)] -ml-1.5"
//                 style={{ background: "rgba(255,255,255,0.1)" }}
//               >
//                 +{meeting.participants?.length - 3}
//               </div>
//             )}
//           </div>
//         </div> */}
//       </div>

//       {/* Divider */}
//       <div className="mx-5 border-t border-[var(--line)]" />

//       {/* Actions */}
//       <div className="flex items-center gap-2 px-5 py-3.5">
//         <button
//           disabled={meeting.status === "Ended"}
//           onClick={handleJoinMeeting}
//           className={`flex-1 py-2 rounded-lg text-xs font-medium text-[var(--content)] flex items-center justify-center gap-1.5`}
//           style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
//         >
//           <Video size={13} /> Join Now
//         </button>
//         <button
//           onClick={() => setInviteOpen(true)}
//           className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--content)]/50 hover:text-[var(--accent-fg)] hover:bg-[var(--accent)]/10 transition-colors border border-[var(--line)]"
//           title="Invite people"
//         >
//           <UserPlus size={13} />
//         </button>
//         {canModify && (
//           <>
//             <button
//               onClick={() => onEdit(meeting)}
//               className="w-8 h-8 rounded-lg flex items-center justify-center text-sky-400/50 hover:text-sky-600 hover:bg-[var(--accent)]/10 transition-colors border border-[var(--line)]"
//             >
//               <Pencil size={13} />
//             </button>
//             <button
//               onClick={() => setIsDeleteConfirmModalOpen(true)}
//               className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-[var(--line)]"
//             >
//               <Trash2 size={13} />
//             </button>
//           </>
//         )}
//       </div>
//       <InviteModal
//         open={inviteOpen}
//         onClose={() => setInviteOpen(false)}
//         roomCode={meeting.roomCode}
//       />
//       {isEdit&&<ScheduleMeetingModal isOpen={isEdit} 
//         onClose={()=>setIsEdit(false)}
//         hostEmail={user?.email}
//         type={"edit"}
//         editMeeting={meeting}/>
//       }

//       {
//       isDeleteConfirmModalOpen&&<DeleteConfirmModal isOpen={isDeleteConfirmModalOpen} onClose={()=>setIsDeleteConfirmModalOpen(false)} meetingId={meeting?.id} />
//       }
//     </div>
//   );
// };
// export default MeetingCard;
import { useState } from "react";
import {
  Video,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  UserPlus,
  Download,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import InviteModal from "./InviteModal";
import ScheduleMeetingModal from "../pages/meetings/ScheduleMeetingModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useTranslation } from "react-i18next";
import { getActiveMeeting } from "../utils/activeMeeting";
import { selectAccessToken } from "../redux/features/auth/authSlice";

const AVATAR_COLORS = [
  "from-[var(--accent)] to-[var(--accent)]",
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
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

// Backend có thể trả status dạng số hoặc chuỗi → chuẩn hóa về một nhãn chuỗi
const STATUS_BY_CODE = { 0: "Scheduled", 1: "WaitingForHost", 2: "Live", 3: "Ended" };
const normalizeStatus = (status) =>
  typeof status === "number" ? STATUS_BY_CODE[status] ?? "Scheduled" : status ?? "Scheduled";

const MeetingCard = ({ meeting, onDelete }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector(selectAccessToken);
  const [isEdit, setIsEdit] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Xuất danh sách điểm danh (CSV) — chỉ host, sau khi họp kết thúc
  const handleExportAttendance = async () => {
    try {
      setExporting(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/meeting/${meeting.roomCode}/attendance`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(body?.message || t("meetingCard.exportError", "Không thể xuất điểm danh"));
        return;
      }
      const rows = body.data || [];
      if (rows.length === 0) {
        toast(t("meetingCard.noAttendance", "Chưa có ai tham gia"));
        return;
      }
      const fmt = (d) =>
        d
          ? new Date(d.endsWith("Z") ? d : d + "Z").toLocaleString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
            })
          : "";
      const header = ["Tên", "Email", "Vào lúc", "Rời lúc", "Số phút"];
      const lines = rows.map((r) => [
        r.displayName,
        r.userEmail || "",
        fmt(r.joinedAt),
        fmt(r.leftAt),
        r.durationMinutes,
      ]);
      const csv = [header, ...lines]
        .map((row) => row.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");
      // BOM để Excel đọc đúng tiếng Việt
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diem-danh-${meeting.roomCode}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("meetingCard.exportError", "Không thể xuất điểm danh"));
    } finally {
      setExporting(false);
    }
  };

  const handleJoinMeeting = () => {
    const active = getActiveMeeting();
    if (active && active !== meeting.roomCode) {
      toast.error(t('common.alreadyInMeeting'));
      return;
    }
    navigate(`${meeting.meetingLink}`);
  };

  const status = normalizeStatus(meeting.status);
  // Không cho sửa/xóa khi cuộc họp đang diễn ra
  const canModify = status !== "Live";
  // Cuộc họp được mời (không phải mình tổ chức) → chỉ cho tham gia
  const isInvited = meeting._source === "invited";
  // Người tổ chức xem chính cuộc họp của mình
  const isHost =
    meeting._source === "owned" ||
    meeting._source === "hosted" ||
    meeting.hostName === user?.email ||
    meeting.hostEmail === user?.email;
  // Trạng thái chờ: host thấy "Chờ bắt đầu", người khác thấy "Chờ chủ phòng"
  const displayStatus =
    status === "WaitingForHost" && isHost ? "WaitingToStart" : status;

  const statusColor = {
    Scheduled: "text-[var(--accent-fg)] bg-[var(--accent)]/15",
    Live: "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15",
    Ended: "text-red-700 dark:text-red-300 bg-red-500/15",
    WaitingForHost: "text-yellow-700 dark:text-yellow-300 bg-yellow-500/15",
  };

  const isEnded = status === "Ended";

  return (
    <div
      className={`rounded-2xl border border-[var(--line)] overflow-hidden flex flex-col transition-transform hover:-translate-y-0.5 relative ${
        isEnded ? "opacity-50 pointer-events-none" : ""
      }`}
      style={{ background: "var(--surface)" }}
    >
      <div
        className="h-1 w-full"
        style={{
          background:
            meeting.hostName === user?.email
              ? "linear-gradient(90deg, #a855f7, #7c3aed)"
              : "linear-gradient(90deg, #60a5fa, #60a5fa)",
        }}
      />

      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Title + Status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[var(--content)] text-sm font-medium leading-snug flex-1">
            {meeting.title}
          </h3>
          <span
            className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
              statusColor[status] || "text-[var(--content)]/50 bg-[var(--overlay)]"
            }`}
          >
            {t(`meetingCard.status.${displayStatus}`, displayStatus)}
          </span>
        </div>

        {/* Description */}
        <p className="text-[var(--content)]/50 text-xs leading-relaxed line-clamp-2">
          {meeting.description}
        </p>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex items-center gap-2 text-[var(--content)]/40 text-xs">
            <Calendar size={12} className="text-cyan-400" />
            <span>{formatDate(meeting.scheduledDateTime)}</span>
            <span className="text-[var(--content)]/20">•</span>
            <Clock size={12} className="text-cyan-400" />
            <span>{formatTime(meeting.scheduledDateTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--content)]/40 text-xs">
            <Clock size={12} className="text-cyan-400" />
            <span>{t('meetingCard.minutes', { count: meeting.duration })}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--overlay)] border border-[var(--line)] text-[var(--content)]/50 tracking-widest">
              {meeting.roomCode}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-[var(--line)]" />

      {/* Actions */}
      <div className="flex items-center gap-2 px-5 py-3.5">
        <button
          onClick={handleJoinMeeting}
          className="flex-1 py-2 rounded-lg text-xs font-medium text-white flex items-center justify-center gap-1.5"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
        >
          <Video size={13} /> {t('meetingCard.joinNow')}
        </button>
        {isHost && isEnded && (
          <button
            onClick={handleExportAttendance}
            disabled={exporting}
            title={t('meetingCard.exportAttendance', 'Xuất điểm danh')}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[var(--line)] text-[var(--content)]/70 hover:text-[var(--accent-fg)] hover:bg-[var(--accent)]/10 transition-colors disabled:opacity-50"
          >
            <Download size={13} />
            {exporting ? t('meetingCard.exporting', 'Đang xuất…') : t('meetingCard.export', 'Xuất điểm danh')}
          </button>
        )}
        {!isInvited && (
          <>
            <button
              onClick={() => setInviteOpen(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--content)]/50 hover:text-[var(--accent-fg)] hover:bg-[var(--accent)]/10 transition-colors border border-[var(--line)]"
              title={t('meetingCard.invitePeople')}
            >
              <UserPlus size={13} />
            </button>
            {canModify && (
              <>
                <button
                  onClick={() => setIsEdit(true)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sky-400/50 hover:text-sky-600 hover:bg-[var(--accent)]/10 transition-colors border border-[var(--line)]"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setIsDeleteConfirmModalOpen(true)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-[var(--line)]"
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </>
        )}
      </div>

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        roomCode={meeting.roomCode}
      />
      {isEdit && (
        <ScheduleMeetingModal
          isOpen={isEdit}
          onClose={() => setIsEdit(false)}
          hostEmail={user?.email}
          type="edit"
          editMeeting={meeting}
        />
      )}
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