import { Trash2, X, AlertTriangle } from "lucide-react";
import { useDeleteMeetingApiMutation } from "../redux/features/meetings/meetingsApi";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  title,
  description,
  meetingId
}) => {
  const { t } = useTranslation();
  const [deleteMeetingApi, {isLoading:deleteLoading}]=useDeleteMeetingApiMutation()
  if (!isOpen) return null;
  const handleClose = () => {
    if (deleteLoading) return;
    onClose();
  };
  const onConfirm=async()=>{
    try {
      const res=await deleteMeetingApi(meetingId).unwrap()
      toast.success(t("deleteConfirmModal.deleteSuccess"))
    } catch (error) {
      console.log(error)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/60">
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden border border-[var(--line)]"
        style={{ background: "var(--surface)" }}
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
              <p className="text-[var(--content)] text-sm font-medium">{t("deleteConfirmModal.confirmDelete")}</p>
              <p className="text-[var(--content)]/70 text-xs">{t("deleteConfirmModal.permanent")}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-[var(--content)] hover:bg-white/25 transition-colors"
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
              <p className="text-[var(--content)] text-sm font-medium">{title || t("deleteConfirmModal.defaultTitle")}</p>
              <p className="text-[var(--content)]/60 text-xs">{description || t("deleteConfirmModal.defaultDescription")}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={handleClose}
              disabled={deleteLoading}
              className="flex-1 cursor-pointer py-3 rounded-lg text-sm text-[var(--content)]/70 border border-[var(--line)] hover:border-[var(--line)] transition-colors disabled:opacity-70"
            >
              {t("deleteConfirmModal.cancel")}
            </button>
            <button
              onClick={onConfirm}
              disabled={deleteLoading}
              className="flex-[2] cursor-pointer py-3 rounded-lg text-sm font-medium text-[var(--content)] flex items-center justify-center gap-2 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
            >
              <Trash2 size={16} />
              {deleteLoading ? t("deleteConfirmModal.deleting") : t("deleteConfirmModal.delete")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteConfirmModal;