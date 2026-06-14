import React, { useState, useRef, useEffect } from "react";
import { Bell, X, ChevronRight, Check, XCircle, Video, Loader2, ChevronDown, Hash, Clock, User } from "lucide-react";
import { useNotification } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectAccessToken } from "../redux/features/auth/authSlice";
import { acceptInvite, rejectInvite, getMeetingStatus } from "../api/notificationApi";
import meetingsApi from "../redux/features/meetings/meetingsApi";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

function timeAgo(dateStr, t) {
  const normalized = dateStr.endsWith("Z") ? dateStr : dateStr + "Z";
  const diff = Math.floor((Date.now() - new Date(normalized).getTime()) / 1000);
  if (diff < 60) return t("notificationBell.timeAgo.justNow");
  if (diff < 3600) return t("notificationBell.timeAgo.minutes", { count: Math.floor(diff / 60) });
  if (diff < 86400) return t("notificationBell.timeAgo.hours", { count: Math.floor(diff / 3600) });
  return t("notificationBell.timeAgo.days", { count: Math.floor(diff / 86400) });
}

// Sắp xếp notification mới nhất lên đầu (theo createdAt giảm dần).
// Chuẩn hóa "Z" để noti từ DB (UTC, không có Z) và noti realtime so sánh nhất quán.
function sortByNewest(list) {
  const ts = (d) => {
    if (!d) return 0;
    const s = typeof d === "string" && !d.endsWith("Z") ? d + "Z" : d;
    return new Date(s).getTime();
  };
  return [...list].sort((a, b) => ts(b.createdAt) - ts(a.createdAt));
}

function NotiIcon({ type }) {
  const base =
    "w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0";
  if (type === "MeetingInvite")
    return (
      <div className={`${base} bg-[var(--accent)]/20 border border-[var(--accent)]/30`}>
        📩
      </div>
    );
  if (type === "MeetingStarted")
    return (
      <div className={`${base} bg-[var(--accent)]/20 border border-[var(--accent)]/30`}>
        ▶️
      </div>
    );
  if (type === "MeetingInviteResponse")
    return (
      <div className={`${base} bg-blue-500/15 border border-blue-500/25`}>
        🔔
      </div>
    );
  return (
    <div className={`${base} bg-[var(--overlay)] border border-[var(--line)]`}>🔔</div>
  );
}

function NotiActions({ noti, onClose, status, setStatus }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector(selectAccessToken);
  const { markOneRead, refetch } = useNotification();

  if (noti.type === "MeetingStarted") {
    let joinLink = "#";
    try {
      const parsed = JSON.parse(noti.payload) ?? {};
      joinLink = parsed.joinLink ?? parsed.JoinLink ?? "#";
    } catch {}
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(joinLink);
          onClose();
        }}
        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--content)] text-xs font-semibold rounded-lg transition"
      >
        <Video className="w-3.5 h-3.5" />
        {t("notificationBell.joinNow")}
      </button>
    );
  }

  if (noti.type === "MeetingInvite") {
    let payload = {};
    try {
      payload = typeof noti.payload === "string"
        ? JSON.parse(noti.payload) ?? {}
        : noti.payload ?? {};
    } catch {}
    const inviteId = payload.inviteId ?? payload.InviteId ?? payload.id ?? payload.Id;
    // Trạng thái đã phản hồi được lưu trong payload (backend cập nhật khi accept/decline).
    // Dùng nó để sau khi đóng/mở lại bell vẫn hiển thị đúng, không hiện lại nút.
    const persisted = String(payload.status ?? payload.Status ?? "").toLowerCase();
    const display =
      status === "accepted" || persisted === "accepted"
        ? "accepted"
        : status === "rejected" || persisted === "declined" || persisted === "rejected"
        ? "rejected"
        : status;
    if (display === "accepted")
      return (
        <span className="mt-2 inline-flex items-center gap-1 text-xs text-green-400 font-medium">
          <Check className="w-3.5 h-3.5" /> {t("notificationBell.accepted")}
        </span>
      );
    if (display === "rejected")
      return (
        <span className="mt-2 inline-flex items-center gap-1 text-xs text-red-400 font-medium">
          <XCircle className="w-3.5 h-3.5" /> {t("notificationBell.rejected")}
        </span>
      );

    const handleAccept = async (e) => {
      e.stopPropagation();
      if (!inviteId) { toast.error(t("notificationBell.inviteExpired")); return; }
      setStatus("loading-accept");
      try {
        const res = await acceptInvite(inviteId, token);
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus("accepted");
          markOneRead(noti.notificationId);
          refetch();
          // Làm mới danh sách cuộc họp để cuộc họp vừa nhận lời mời hiện ra ngay (không cần F5)
          dispatch(meetingsApi.util.invalidateTags(["Meetings"]));
        } else {
          setStatus("idle");
          toast.error(body?.message || t("notificationBell.actionFailed"));
        }
      } catch { setStatus("idle"); toast.error(t("notificationBell.actionFailed")); }
    };

    const handleReject = async (e) => {
      e.stopPropagation();
      if (!inviteId) { toast.error(t("notificationBell.inviteExpired")); return; }
      setStatus("loading-reject");
      try {
        const res = await rejectInvite(inviteId, token);
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus("rejected");
          markOneRead(noti.notificationId);
          refetch();
        } else {
          setStatus("idle");
          toast.error(body?.message || t("notificationBell.actionFailed"));
        }
      } catch { setStatus("idle"); toast.error(t("notificationBell.actionFailed")); }
    };

    const isLoading = status === "loading-accept" || status === "loading-reject";

    return (
      <div className="mt-2 flex gap-2">
        <button
          onClick={handleAccept}
          disabled={isLoading}
          className="flex items-center gap-1 px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--content)] text-xs font-semibold rounded-lg transition"
        >
          {status === "loading-accept"
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Check className="w-3.5 h-3.5" />}
          {t("notificationBell.accept")}
        </button>
        <button
          onClick={handleReject}
          disabled={isLoading}
          className="flex items-center gap-1 px-3 py-1.5 bg-transparent hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-red-400 border border-red-500/30 hover:border-red-500/50 text-xs font-semibold rounded-lg transition"
        >
          {status === "loading-reject"
            ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
            : <XCircle className="w-3.5 h-3.5" />}
          {t("notificationBell.reject")}
        </button>
      </div>
    );
  }

  return null;
}

function NotiDetail({ noti }) {
  let payload = {};
  try {
    payload = typeof noti.payload === "string"
      ? JSON.parse(noti.payload) ?? {}
      : noti.payload ?? {};
  } catch {}

  const title = payload.title || payload.meetingTitle;
  const host = payload.hostName || payload.hostEmail;
  const roomCode = payload.roomCode;
  const scheduledAt = payload.scheduledDateTime || payload.scheduledAt;
  const duration = payload.duration;

  if (!title && !host && !roomCode && !scheduledAt) return null;

  return (
    <div className="mt-2 rounded-lg border border-[var(--line)] bg-[var(--overlay)] px-3 py-2.5 flex flex-col gap-1.5">
      {title && (
        <p className="text-xs font-medium text-[var(--content)] truncate">{title}</p>
      )}
      {host && (
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
          <User className="w-3 h-3 shrink-0" />
          <span className="truncate">{host}</span>
        </div>
      )}
      {roomCode && (
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
          <Hash className="w-3 h-3 shrink-0" />
          <span className="font-mono tracking-wider">{roomCode}</span>
        </div>
      )}
      {scheduledAt && (
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
          <Clock className="w-3 h-3 shrink-0" />
          <span>
            {new Date(scheduledAt).toLocaleString("vi-VN", {
              day: "2-digit", month: "2-digit", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
            {duration ? ` · ${duration} phút` : ""}
          </span>
        </div>
      )}
    </div>
  );
}

function NotiRow({ noti, onRead, onClose }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [actionStatus, setActionStatus] = useState("idle");

  const handleClick = () => {
    if (!noti.isRead) onRead(noti.notificationId);
    setOpen((p) => !p);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition ${
        !noti.isRead
          ? "bg-[var(--accent)]/[0.08] hover:bg-[var(--accent)]/[0.12]"
          : "hover:bg-[var(--overlay)]"
      }`}
    >
      <NotiIcon type={noti.type} />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug ${
            !noti.isRead ? "text-[var(--content)] font-medium" : "text-[var(--muted)]"
          }`}
        >
          {noti.title}
        </p>
        <p className="text-xs text-[var(--faint)] mt-0.5">{timeAgo(noti.createdAt, t)}</p>
        {open && (
          <NotiActions
            noti={noti}
            onClose={onClose}
            status={actionStatus}
            setStatus={setActionStatus}
          />
        )}
      </div>
      {!noti.isRead && (
        <span className="w-2 h-2 rounded-full bg-[var(--accent-fg)] flex-shrink-0 mt-1.5" />
      )}
    </div>
  );
}

function NotificationPanel({ onClose }) {
  const { t } = useTranslation();
  const { notifications, unreadCount, markAllRead, markOneRead, refetch:fetchNotifications } = useNotification();
  const sortedNotis = sortByNewest(notifications);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      <div
        className="relative z-10 w-full max-w-md h-full bg-[var(--surface)] border-l border-[var(--line)] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "slideInRight 0.22s cubic-bezier(.4,0,.2,1)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[var(--accent-fg)]" />
            <span className="font-semibold text-[var(--content)]">{t("notificationBell.title")}</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-[var(--accent)]/25 text-[var(--accent-fg)] text-xs font-bold rounded-full border border-[var(--accent)]/30">
                {t("notificationBell.unreadBadge", { count: unreadCount })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[var(--accent-fg)] hover:text-[var(--accent-fg)] transition"
              >
                {t("notificationBell.markAllRead")}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--overlay)] text-[var(--muted)] hover:text-[var(--content)] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--line)]">
          {notifications.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-[var(--faint)]">
              <Bell className="w-10 h-10 opacity-20" />
              <span className="text-sm">{t("notificationBell.empty")}</span>
            </div>
          ) : (
            sortedNotis.map((noti) => (
              <NotiRow
                key={noti.notificationId}
                noti={noti}
                onRead={markOneRead}
                onClose={onClose}
              />
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function NotificationBell() {
  const { t } = useTranslation();
  const { notifications, unreadCount, markAllRead, markOneRead, refetch:fetchNotifications } = useNotification();
  const [open, setOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const PREVIEW_COUNT = 5;
  const previewNotis = sortByNewest(notifications).slice(0, PREVIEW_COUNT);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Bell button */}
        <button
          onClick={() => setOpen((p) => !p)}
          className="relative flex items-center justify-center w-10 h-10 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--accent-fg)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/10 transition"
          aria-label={t("notificationBell.title")}
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-[var(--content)] text-[9px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-[var(--bg)]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-80 bg-[var(--surface)] rounded-xl border border-[var(--line)] z-50 overflow-hidden shadow-[0_20px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--content)] text-sm">{t("notificationBell.title")}</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-[var(--accent)]/25 text-[var(--accent-fg)] text-[10px] font-bold rounded-full border border-[var(--accent)]/30">
                    {t("notificationBell.unreadBadge", { count: unreadCount })}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[var(--accent-fg)] hover:text-[var(--accent-fg)] transition"
                >
                  {t("notificationBell.markAllRead")}
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[var(--line)]">
              {previewNotis.length === 0 ? (
                <div className="py-10 flex flex-col items-center gap-2 text-[var(--faint)]">
                  <Bell className="w-8 h-8 opacity-20" />
                  <span className="text-sm">{t("notificationBell.empty")}</span>
                </div>
              ) : (
                previewNotis.map((noti) => (
                  <NotiRow
                    key={noti.notificationId}
                    noti={noti}
                    onRead={markOneRead}
                    onClose={() => setOpen(false)}
                  />
                ))
              )}
            </div>
            <button
              onClick={() => { setOpen(false); setPanelOpen(true); }}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-3 border-t border-[var(--line)] text-sm text-[var(--accent-fg)] font-medium hover:bg-[var(--accent)]/10 transition"
            >
              {t("notificationBell.viewAll")}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {panelOpen && <NotificationPanel onClose={() => setPanelOpen(false)} />}
    </>
  );
}