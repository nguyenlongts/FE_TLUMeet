import { Trash2, X, AlertTriangle } from "lucide-react";
import { useDeleteMeetingApiMutation } from "../redux/features/meetings/meetingsApi";

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  title = "Delete Item",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  meetingId
}) => {
  const [deleteMeetingApi, {isLoading:deleteLoading}]=useDeleteMeetingApiMutation()
  if (!isOpen) return null;
  const handleClose = () => {
    if (deleteLoading) return;
    onClose();
  };
  const onConfirm=async()=>{
    try {
      const res=await deleteMeetingApi(meetingId)
      console.log(res)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden border border-white/8"
        style={{ background: "#1a1d2e" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Trash2 size={18} color="white" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Confirm Delete</p>
              <p className="text-white/70 text-xs">This action is permanent</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-6">
          {/* Warning Icon */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(239,68,68,0.15)" }}
            >
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">{title}</p>
              <p className="text-white/60 text-xs">{description}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={handleClose}
              disabled={deleteLoading}
              className="flex-1 cursor-pointer py-3 rounded-lg text-sm text-white/70 border border-white/15 hover:border-white/30 transition-colors disabled:opacity-70"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleteLoading}
              className="flex-[2] cursor-pointer py-3 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
            >
              <Trash2 size={16} />
              {deleteLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;