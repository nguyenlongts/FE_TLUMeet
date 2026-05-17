import { Search, Video, Calendar, Clock, Pencil, Trash2, Plus, Users } from "lucide-react";
import { createPortal } from "react-dom";


const DeleteModal = ({ meeting, onClose, onConfirm }) => {
  return createPortal(
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
    <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-white/8" style={{ background: "#1a1d2e" }}>
      <div className="flex items-center justify-between px-6 py-5" style={{ background: "linear-gradient(135deg, #ef4444, #b91c1c)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <Trash2 size={16} color="white" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Delete Meeting</p>
            <p className="text-white/70 text-xs">This action cannot be undone</p>
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors">✕</button>
      </div>
      <div className="p-6 flex flex-col gap-5">
        <p className="text-white/70 text-sm leading-relaxed">
          Are you sure you want to delete <span className="text-white font-medium">"{meeting.title}"</span>? This meeting will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-lg text-sm text-white/70 border border-white/15 hover:border-white/30 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-[2] py-3 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #ef4444, #b91c1c)" }}>
            <Trash2 size={15} /> Delete Meeting
          </button>
        </div>
      </div>
    </div>
  </div>,
  document.body
)};
export default DeleteModal