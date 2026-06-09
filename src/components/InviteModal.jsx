import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, UserPlus } from "lucide-react";
import { sendInvites } from "../api/notificationApi";
import { useSelector } from "react-redux";
import { selectAccessToken } from "../redux/features/auth/authSlice";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

export default function InviteModal({ open, onClose, roomCode }) {
  const { t } = useTranslation();
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
      toast.error(t("inviteModal.emailInvalid"));
      return;
    }
    if (emails.includes(value)) {
      toast.error(t("inviteModal.emailDuplicate"));
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
      toast.error(t("inviteModal.noRoomCode"));
      return;
    }
    try {
      setLoading(true);
      const res = await sendInvites(roomCode, emails, token);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || t("inviteModal.errorStatus", { status: res.status }));
      }
      toast.success(t("inviteModal.sendSuccess", { count: emails.length }));
      setEmails([]);
      onClose();
    } catch (err) {
      toast.error(t("inviteModal.sendError", { error: err.message }));
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
          className="w-full max-w-md bg-[var(--surface)] rounded-2xl shadow-xl p-5 text-[var(--content)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <UserPlus size={18} /> {t("inviteModal.title")}
            </h2>
            <div className="flex items-center gap-2">
              {roomCode && (
                <span className="text-xs text-[var(--content)]/40 font-mono bg-[var(--overlay)] px-2 py-1 rounded">
                  {roomCode}
                </span>
              )}
              <button onClick={handleClose}>
                <X className="text-[var(--content)]/50 hover:text-[var(--content)]" />
              </button>
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <div className="flex items-center flex-1 bg-[var(--overlay)] px-3 rounded-lg border border-[var(--line)]">
              <Mail size={14} className="text-[var(--content)]/40" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                placeholder={t("inviteModal.emailPlaceholder")}
                className="bg-transparent outline-none px-2 py-2 text-sm flex-1"
              />
            </div>
            <button
              onClick={handleAddEmail}
              className="px-3 py-2 bg-[var(--accent)] rounded-lg text-sm cursor-pointer hover:bg-[var(--accent)] transition"
            >
              {t("inviteModal.add")}
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
                    className="text-[var(--content)]/50 hover:text-[var(--content)]"
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
              className="px-3 py-1.5 text-sm text-[var(--content)]/60 hover:text-[var(--content)] transition"
            >
              {t("inviteModal.cancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || emails.length === 0}
              className="px-4 py-1.5 bg-[var(--accent)] text-sm cursor-pointer rounded-lg hover:bg-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? t("inviteModal.sending") : t("inviteModal.sendInvite", { count: emails.length })}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
