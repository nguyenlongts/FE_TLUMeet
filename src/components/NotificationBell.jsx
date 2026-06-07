import React, { useState, useRef, useEffect } from "react";
import { Bell, X, ChevronRight, Check, XCircle, Video, Loader2, ChevronDown, Hash, Clock, User } from "lucide-react";
import { useNotification } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAccessToken } from "../redux/features/auth/authSlice";
import { acceptInvite, rejectInvite } from "../api/notificationApi";

function timeAgo(dateStr) {
  const normalized = dateStr.endsWith("Z") ? dateStr : dateStr + "Z";
  const diff = Math.floor((Date.now() - new Date(normalized).getTime()) / 1000);
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

function NotiIcon({ type }) {
  const base =
    "w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0";
  if (type === "MeetingInvite")
    return (
      <div className={`${base} bg-purple-500/20 border border-purple-500/30`}>
        📩
      </div>
    );
  if (type === "MeetingStarted")
    return (
      <div className={`${base} bg-green-500/15 border border-green-500/25`}>
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
    <div className={`${base} bg-white/5 border border-white/10`}>🔔</div>
  );
}

function NotiActions({ noti, onClose, status, setStatus }) {
  const navigate = useNavigate();
  const token = useSelector(selectAccessToken);
  const { markOneRead } = useNotification();

  if (noti.type === "MeetingStarted") {
    let joinLink = "#";
    try {
      joinLink = JSON.parse(noti.payload)?.joinLink ?? "#";
    } catch {}
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(joinLink);
          onClose();
        }}
        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition"
      >
        <Video className="w-3.5 h-3.5" />
        Tham gia ngay
      </button>
    );
  }

  if (noti.type === "MeetingInvite") {
    let payload = {};
    try {
      payload = JSON.parse(noti.payload) ?? {};
    } catch {}
    // const inviteId = payload.InviteId??payload.inviteId;
    const inviteId= payload.inviteId
    console.log(payload, "invite payload") // xem payload trông như thế nào
    if (status === "accepted")
      return (
        <span className="mt-2 inline-flex items-center gap-1 text-xs text-green-400 font-medium">
          <Check className="w-3.5 h-3.5" /> Đã chấp nhận
        </span>
      );
    if (status === "rejected")
      return (
        <span className="mt-2 inline-flex items-center gap-1 text-xs text-red-400 font-medium">
          <XCircle className="w-3.5 h-3.5" /> Đã từ chối
        </span>
      );

    const handleAccept = async (e) => {
      e.stopPropagation();
      if (!inviteId) return;
      setStatus("loading-accept");
      try {
        const res = await acceptInvite(inviteId, token);
        if (res.ok) { setStatus("accepted"); markOneRead(noti.notificationId);}
        else setStatus("idle");
      } catch { setStatus("idle"); }
    };

    const handleReject = async (e) => {
      e.stopPropagation();
      if (!inviteId) return;
      setStatus("loading-reject");
      try {
        const res = await rejectInvite(inviteId, token);
        if (res.ok) { setStatus("rejected"); markOneRead(noti.notificationId); }
        else setStatus("idle");
      } catch { setStatus("idle"); }
    };

    const isLoading = status === "loading-accept" || status === "loading-reject";

    return (
      <div className="mt-2 flex gap-2">
        <button
          onClick={handleAccept}
          disabled={isLoading}
          className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition"
        >
          {status === "loading-accept"
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Check className="w-3.5 h-3.5" />}
          Đồng ý
        </button>
        <button
          onClick={handleReject}
          disabled={isLoading}
          className="flex items-center gap-1 px-3 py-1.5 bg-transparent hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-red-400 border border-red-500/30 hover:border-red-500/50 text-xs font-semibold rounded-lg transition"
        >
          {status === "loading-reject"
            ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
            : <XCircle className="w-3.5 h-3.5" />}
          Từ chối
        </button>
      </div>
    );
  }

  return null;
}

function NotiDetail({ noti }) {
  let payload = {};
  try { payload = JSON.parse(noti.payload) ?? {}; } catch {}

  const title = payload.title || payload.meetingTitle;
  const host = payload.hostName || payload.hostEmail;
  const roomCode = payload.roomCode;
  const scheduledAt = payload.scheduledDateTime || payload.scheduledAt;
  const duration = payload.duration;

  if (!title && !host && !roomCode && !scheduledAt) return null;

  return (
    <div className="mt-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 flex flex-col gap-1.5">
      {title && (
        <p className="text-xs font-medium text-slate-200 truncate">{title}</p>
      )}
      {host && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <User className="w-3 h-3 shrink-0" />
          <span className="truncate">{host}</span>
        </div>
      )}
      {roomCode && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Hash className="w-3 h-3 shrink-0" />
          <span className="font-mono tracking-wider">{roomCode}</span>
        </div>
      )}
      {scheduledAt && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
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
          ? "bg-violet-500/[0.08] hover:bg-violet-500/[0.12]"
          : "hover:bg-white/[0.04]"
      }`}
    >
      <NotiIcon type={noti.type} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-sm leading-snug flex-1 ${
              !noti.isRead ? "text-slate-100 font-medium" : "text-slate-400"
            }`}
          >
            {noti.title}
          </p>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{timeAgo(noti.createdAt)}</p>
        {open && (
          <div onClick={(e) => e.stopPropagation()}>
            <NotiDetail noti={noti} />
            <NotiActions noti={noti} onClose={onClose} status={actionStatus} setStatus={setActionStatus} />
          </div>
        )}
      </div>
      {!noti.isRead && (
        <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0 mt-1.5" />
      )}
    </div>
  );
}

function NotificationPanel({ onClose }) {
  const { notifications, unreadCount, markAllRead, markOneRead, refetch:fetchNotifications } = useNotification();

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      <div
        className="relative z-10 w-full max-w-md h-full bg-[#1e2235] border-l border-white/[0.08] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "slideInRight 0.22s cubic-bezier(.4,0,.2,1)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-violet-400" />
            <span className="font-semibold text-slate-100">Thông báo</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-violet-500/25 text-violet-400 text-xs font-bold rounded-full border border-violet-500/30">
                {unreadCount} mới
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-violet-400 hover:text-violet-300 transition"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.06]">
          {notifications.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-slate-500">
              <Bell className="w-10 h-10 opacity-20" />
              <span className="text-sm">Không có thông báo nào</span>
            </div>
          ) : (
            notifications.map((noti) => (
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
  const previewNotis = notifications.slice(0, PREVIEW_COUNT);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Bell button */}
        <button
          onClick={() => setOpen((p) => !p)}
          className="relative flex items-center justify-center w-10 h-10 rounded-lg border border-white/[0.08] bg-[#1e2235] text-slate-400 hover:text-violet-400 hover:border-violet-500/40 hover:bg-violet-500/10 transition"
          aria-label="Thông báo"
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-[#0f1117]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-80 bg-[#1e2235] rounded-xl border border-white/[0.08] z-50 overflow-hidden shadow-[0_20px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100 text-sm">Thông báo</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-violet-500/25 text-violet-400 text-[10px] font-bold rounded-full border border-violet-500/30">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-violet-400 hover:text-violet-300 transition"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.06]">
              {previewNotis.length === 0 ? (
                <div className="py-10 flex flex-col items-center gap-2 text-slate-500">
                  <Bell className="w-8 h-8 opacity-20" />
                  <span className="text-sm">Không có thông báo nào</span>
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
              className="w-full flex items-center justify-center gap-1.5 px-4 py-3 border-t border-white/[0.08] text-sm text-violet-400 font-medium hover:bg-violet-500/10 transition"
            >
              Xem tất cả thông báo
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {panelOpen && <NotificationPanel onClose={() => setPanelOpen(false)} />}
    </>
  );
}