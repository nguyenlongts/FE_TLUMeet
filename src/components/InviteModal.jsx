import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, UserPlus } from "lucide-react";
import { sendInvites } from "../api/notificationApi";
import { useSelector } from "react-redux";
import { selectAccessToken } from "../redux/features/auth/authSlice";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

export default function InviteModal({ open, onClose, roomCode }) {
  const token = useSelector(selectAccessToken);
  const [input, setInput] = useState("");
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleAddEmail = () => {
    const value = input.trim().toLowerCase();
    if (!value) return;
    if (!isValidEmail(value)) {
      toast.error("Email không hợp lệ");
      return;
    }
    if (emails.includes(value)) {
      toast.error("Email đã có trong danh sách");
      return;
    }
    setEmails((prev) => [...prev, value]);
    setInput("");
  };

  const handleRemove = (email) =>
    setEmails((prev) => prev.filter((e) => e !== email));

  const handleSubmit = async () => {
    if (emails.length === 0) return;
    if (!roomCode) {
      toast.error("Không tìm thấy mã phòng họp");
      return;
    }
    try {
      setLoading(true);
      const res = await sendInvites(roomCode, emails, token);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = body?.Message || body?.message || `Lỗi ${res.status}`;
        if (res.status === 409) {
          toast.error(msg, { duration: 5000 });
        } else {
          toast.error("Gửi lời mời thất bại: " + msg);
        }
        return;
      }
      toast.success(`Đã gửi lời mời tới ${emails.length} người`);
      setEmails([]);
      onClose();
    } catch (err) {
      toast.error("Gửi lời mời thất bại: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInput("");
    setEmails([]);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 40 }}
          className="w-full max-w-md bg-[#1e2235] rounded-2xl shadow-xl p-5 text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <UserPlus size={18} /> Invite people
            </h2>
            <div className="flex items-center gap-2">
              {roomCode && (
                <span className="text-xs text-white/40 font-mono bg-white/5 px-2 py-1 rounded">
                  {roomCode}
                </span>
              )}
              <button onClick={handleClose}>
                <X className="text-white/50 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <div className="flex items-center flex-1 bg-white/5 px-3 rounded-lg border border-white/10">
              <Mail size={14} className="text-white/40" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                placeholder="Nhập email..."
                className="bg-transparent outline-none px-2 py-2 text-sm flex-1"
              />
            </div>
            <button
              onClick={handleAddEmail}
              className="px-3 py-2 bg-purple-500 rounded-lg text-sm cursor-pointer hover:bg-purple-600 transition"
            >
              Add
            </button>
          </div>

          {/* Email tags */}
          {emails.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {emails.map((email) => (
                <div
                  key={email}
                  className="flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-500/30 px-2 py-1 rounded-full text-xs"
                >
                  <span>{email}</span>
                  <button
                    onClick={() => handleRemove(email)}
                    className="text-white/50 hover:text-white"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end mt-5 gap-2">
            <button
              onClick={handleClose}
              className="px-3 py-1.5 text-sm text-white/60 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || emails.length === 0}
              className="px-4 py-1.5 bg-purple-500 text-sm cursor-pointer rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Đang gửi..." : `Send Invite (${emails.length})`}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
