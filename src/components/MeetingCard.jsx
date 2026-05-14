import { useState } from "react";
import {
  Search,
  Video,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  Plus,
  Users,
  Edit,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import WaitingRoom from "../pages/meetings/WaitingRoom";
import InviteModal from "./InviteModal";
import { UserPlus } from "lucide-react";
import ScheduleMeetingModal from "../pages/meetings/ScheduleMeetingModal";
const AVATAR_COLORS = [
  "from-purple-500 to-violet-600",
  "from-orange-400 to-red-500",
  "from-teal-400 to-cyan-500",
  "from-pink-400 to-rose-500",
];

const formatDate = (dt) => {
  const d = new Date(dt);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dt) => {
  const d = new Date(dt);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};
const MeetingCard = ({ meeting, onDelete }) => {
  const navigate=useNavigate()
  const user=useSelector((state)=>state.auth.user)
  const [isEdit,setIsEdit]=useState(false)
  const [isDeleteConfirmModalOpen,setIsDeleteConfirmModalOpen]=useState(false)
  const handleDelete=()=>{
    setIsDeleteConfirmModalOpen(true)
  }
  const [inviteOpen, setInviteOpen] = useState(false);

  const handleJoinMeeting = () => {
    navigate(`${meeting.meetingLink}`);
  };
  const canModify = meeting.status !== "started";
  const statusColor = {
    Scheduled: "text-purple-300 bg-purple-500/15",
    Live: "text-emerald-300 bg-emerald-500/15",
    Ended: "text-red-300 bg-red-500/15",
    WaitingForHost: "text-yellow-300 bg-yellow-500/15",
  };
  const onEdit = () => {
    setIsEdit(true);
  }
  return (  
    <div
      className="rounded-2xl border border-white/8 overflow-hidden flex flex-col transition-transform
       hover:-translate-y-0.5"
      style={{ background: "#1e2235" }}
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
          <h3 className="text-white text-sm font-medium leading-snug flex-1">
            {meeting.title}
          </h3>
          <span
            className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
              statusColor[meeting.status] || "text-white/50 bg-white/10"
            }`}
          >
            {meeting.status.toUpperCase()}
          </span>
        </div>

        {/* Description */}
        <p className="text-white/50 text-xs leading-relaxed line-clamp-2">
          {meeting.description}
        </p>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <Calendar size={12} className="text-cyan-400" />
            <span>{formatDate(meeting.scheduledDateTime)}</span>
            <span className="text-white/20">•</span>
            <Clock size={12} className="text-cyan-400" />
            <span>{formatTime(meeting.scheduledDateTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <Clock size={12} className="text-cyan-400" />
            <span>{meeting.duration} minutes</span>
          </div>
        </div>

        {/* Participants */}
        {/* <div className="flex items-center gap-2 mt-1">
          <Users size={12} className="text-white/30" />
          <div className="flex items-center">
            {meeting?.participants?.slice(0, 3).map((p, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-medium border-2 border-[#1e2235]`}
                style={{ marginLeft: i > 0 ? "-6px" : "0" }}
              >
                {p}
              </div>
            ))}
            {meeting?.participants?.length > 3 && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white/50 text-xs border-2 border-[#1e2235] -ml-1.5"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                +{meeting.participants?.length - 3}
              </div>
            )}
          </div>
        </div> */}
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-white/6" />

      {/* Actions */}
      <div className="flex items-center gap-2 px-5 py-3.5">
        <button
          onClick={handleJoinMeeting}
          className="flex-1 py-2 rounded-lg text-xs font-medium text-white flex items-center justify-center gap-1.5"
          style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
        >
          <Video size={13} /> Join Now
        </button>
        <button
          onClick={() => setInviteOpen(true)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-purple-400 hover:bg-purple-500/10 transition-colors border border-white/8"
          title="Invite people"
        >
          <UserPlus size={13} />
        </button>
        {canModify && (
          <>
            <button
              onClick={() => onEdit(meeting)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sky-400/50 hover:text-sky-600 hover:bg-purple-500/10 transition-colors border border-white/8"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(meeting)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-white/8"
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        roomCode={meeting.roomCode}
      />
      {isEdit&&<ScheduleMeetingModal isOpen={isEdit} 
        onClose={()=>setIsEdit(false)}
        hostEmail={user?.email}
        type={"edit"}
        meeting={meeting}/>
      }

      {
      isDeleteConfirmModalOpen&&<DeleteConfirmModal isOpen={isDeleteConfirmModalOpen} onClose={()=>setIsDeleteConfirmModalOpen(false)} meetingId={meeting?.id} />
      }
    </div>
  );
};
export default MeetingCard;
