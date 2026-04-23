import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "../context/NotificationContext";
import { acceptInvite, rejectInvite } from "../api/notificationApi";
import { useSelector } from "react-redux";
import { selectAccessToken } from "../redux/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function InvitePopup() {
  const { notifications } = useNotification();
  const token = useSelector(selectAccessToken);
  const navigate = useNavigate();

  const [handledIds, setHandledIds] = useState(new Set());

  const dismiss = useCallback((id) => {
    setHandledIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const pendingInvites = useMemo(
    () =>
      notifications
        .filter(
          (n) =>
            n.type === "MeetingInvite" &&
            !n.isRead &&
            !handledIds.has(n.notificationId),
        )
        .map((n) => ({
          ...n,
          parsedPayload: (() => {
            try {
              return typeof n.payload === "string"
                ? JSON.parse(n.payload)
                : n.payload;
            } catch {
              return {};
            }
          })(),
        })),
    [notifications, handledIds],
  );

  const pendingIds = useMemo(
    () => pendingInvites.map((inv) => inv.notificationId).join(","),
    [pendingInvites],
  );

  useEffect(() => {
    if (pendingInvites.length === 0) return;
    const timers = pendingInvites.map((inv) =>
      setTimeout(() => dismiss(inv.notificationId), 15000),
    );
    return () => timers.forEach(clearTimeout);
  }, [pendingIds, dismiss]);

  const handleAccept = async (inv) => {
    dismiss(inv.notificationId);
    try {
      const res = await acceptInvite(inv.parsedPayload.inviteId, token);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Đã chấp nhận! Đang vào phòng...");
      const link =
        inv.parsedPayload.joinLink || `/meet/${inv.parsedPayload.roomCode}`;
      navigate(link);
    } catch (err) {
      toast.error("Không thể chấp nhận lời mời: " + err.message);
    }
  };

  const handleReject = async (inv) => {
    dismiss(inv.notificationId);
    try {
      await rejectInvite(inv.parsedPayload.inviteId, token);
      toast("Đã từ chối lời mời.");
    } catch (err) {
      console.error("rejectInvite error:", err);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
      <AnimatePresence>
        {pendingInvites.map((inv) => (
          <motion.div
            key={inv.notificationId}
            layout
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{
              duration: 0.25,
              type: "spring",
              stiffness: 520,
              damping: 40,
            }}
            className="pointer-events-auto w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}
            >
              <span className="text-lg">📩</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  Lời mời họp
                </p>
                <p className="text-white/70 text-xs truncate">
                  Từ:{" "}
                  {inv.parsedPayload.hostName ||
                    inv.parsedPayload.hostEmail ||
                    "—"}
                </p>
              </div>
              <button
                onClick={() => dismiss(inv.notificationId)}
                className="text-white/60 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-4 py-3 flex flex-col gap-1">
              <p className="text-sm font-medium text-gray-800 line-clamp-2">
                {inv.parsedPayload.title || inv.title}
              </p>
              <p className="text-xs text-gray-500">
                Phòng:{" "}
                <span className="font-mono text-gray-700">
                  {inv.parsedPayload.roomCode}
                </span>
              </p>
              {inv.parsedPayload.expiresAt && (
                <p className="text-xs text-gray-400">
                  Hết hạn:{" "}
                  {new Date(inv.parsedPayload.expiresAt).toLocaleTimeString(
                    "vi-VN",
                  )}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 px-4 pb-4">
              <button
                onClick={() => handleReject(inv)}
                className="flex-1 py-1.5 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition"
              >
                ✖ Từ chối
              </button>
              <button
                onClick={() => handleAccept(inv)}
                className="flex-[1.4] py-1.5 rounded-lg text-sm font-medium text-white transition"
                style={{
                  background: "linear-gradient(135deg,#a855f7,#7c3aed)",
                }}
              >
                ✔ Chấp nhận
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
