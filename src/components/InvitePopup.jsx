import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "../context/NotificationContext";
import { acceptInvite, rejectInvite } from "../api/notificationApi";
import { useSelector } from "react-redux";
import { selectAccessToken } from "../redux/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Video, X, Check, Clock, Hash } from "lucide-react";

const POPUP_THRESHOLD_MS = 10_000;
export default function InvitePopup() {
  const { notifications } = useNotification();
  const token = useSelector(selectAccessToken);
  const navigate = useNavigate();

  const [handledIds, setHandledIds] = useState(new Set());
  const [countdowns, setCountdowns] = useState({});

  const dismiss = useCallback((id) => {
    setHandledIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setCountdowns((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);


  // const pendingInvites = useMemo(
  //   () =>
  //     notifications
  //       .filter(
  //         (n) =>
  //           n.type === "MeetingInvite" &&
  //           !n.isRead &&
  //           !handledIds.has(n.notificationId),
  //       )
  //       .map((n) => ({
  //         ...n,
  //         parsedPayload: (() => {
  //           try {
  //             return typeof n.payload === "string"
  //               ? JSON.parse(n.payload)
  //               : n.payload;
  //           } catch {
  //             return {};
  //           }
  //         })(),
  //       })),
  //   [notifications, handledIds],
  // );

  const pendingInvites = useMemo(
    () =>
      notifications
        .filter((n) => {
          if (n.type !== "MeetingInvite") return false;
          if (n.isRead) return false;
          if (handledIds.has(n.notificationId)) return false;

          const age = Date.now() - new Date(n.createdAt).getTime();
          if (age > POPUP_THRESHOLD_MS) return false;

          return true;
        })
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

  // Countdown timer: 15s per invite
  useEffect(() => {
    if (pendingInvites.length === 0) return;

    setCountdowns((prev) => {
      const next = { ...prev };
      pendingInvites.forEach((inv) => {
        if (!(inv.notificationId in next)) next[inv.notificationId] = 15;
      });
      return next;
    });

    const interval = setInterval(() => {
      setCountdowns((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach((id) => {
          if (next[id] > 0) {
            next[id] -= 1;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);

    const timers = pendingInvites.map((inv) =>
      setTimeout(() => dismiss(inv.notificationId), 15000),
    );

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [pendingIds, dismiss]);

  const handleAccept = async (inv) => {
    dismiss(inv.notificationId);
    try {
      const res = await acceptInvite(inv.parsedPayload.inviteId, token);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Đã chấp nhận! Bạn sẽ được thông báo khi phòng bắt đầu.");
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
        {pendingInvites.map((inv) => {
          const countdown = countdowns[inv.notificationId] ?? 15;
          const progress = (countdown / 15) * 100;
          const hostLabel =
            inv.parsedPayload.hostName ||
            inv.parsedPayload.hostEmail ||
            "—";
          const hostInitial = hostLabel.charAt(0).toUpperCase();
          const title = inv.parsedPayload.title || inv.title || "Cuộc họp";
          const roomCode = inv.parsedPayload.roomCode;
          const expiresAt = inv.parsedPayload.expiresAt;

          return (
            <motion.div
              key={inv.notificationId}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ duration: 0.22, type: "spring", stiffness: 420, damping: 36 }}
              className="pointer-events-auto w-[340px] rounded-2xl overflow-hidden border border-[#2a2245]"
              style={{ background: "#150f2a" }}
            >
              {/* Progress bar */}
              <div className="h-[3px] w-full" style={{ background: "#2a2245" }}>
                <div
                  className="h-full transition-all duration-1000 ease-linear"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #a855f7, #7c3aed)",
                  }}
                />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
                  >
                    <Video size={15} color="white" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold leading-tight">
                      Lời mời họp
                    </p>
                    <p className="text-[11px] leading-tight" style={{ color: "#8b7bb5" }}>
                      Meeting invitation
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs tabular-nums" style={{ color: "#8b7bb5" }}>
                    {countdown}s
                  </span>
                  <button
                    onClick={() => dismiss(inv.notificationId)}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                    style={{ color: "#8b7bb5" }}
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div
                className="mx-4 mb-3 rounded-xl p-3 border border-[#2a2245]"
                style={{ background: "#0f0a1e" }}
              >
                {/* Meeting title */}
                <p className="text-white text-sm font-medium line-clamp-1 mb-2.5">
                  {title}
                </p>

                {/* Host row */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                    style={{ background: "linear-gradient(135deg, #f97316, #ef4444)" }}
                  >
                    {hostInitial}
                  </div>
                  <span className="text-xs truncate" style={{ color: "#8b7bb5" }}>
                    {hostLabel}
                  </span>
                  <span
                    className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md shrink-0"
                    style={{ background: "#2a2245", color: "#a78bfa" }}
                  >
                    Host
                  </span>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-3 flex-wrap">
                  {roomCode && (
                    <div className="flex items-center gap-1">
                      <Hash size={11} style={{ color: "#8b7bb5" }} />
                      <span className="text-[11px] font-mono" style={{ color: "#8b7bb5" }}>
                        {roomCode}
                      </span>
                    </div>
                  )}
                  {expiresAt && (
                    <div className="flex items-center gap-1">
                      <Clock size={11} style={{ color: "#8b7bb5" }} />
                      <span className="text-[11px]" style={{ color: "#8b7bb5" }}>
                        {new Date(expiresAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 px-4 pb-4">
                <button
                  onClick={() => handleReject(inv)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium border border-[#2a2245] transition-colors hover:bg-white/5"
                  style={{ color: "#ef4444" }}
                >
                  Từ chối
                </button>
                <button
                  onClick={() => handleAccept(inv)}
                  className="flex-[1.6] py-2 rounded-xl text-xs font-medium text-white flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
                >
                  <Check size={13} />
                  Chấp nhận
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}