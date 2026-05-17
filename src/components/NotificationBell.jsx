import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotification } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

function NotiIcon({ type }) {
  const base =
    "w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0";
  if (type === "invitation")
    return <div className={`${base} bg-indigo-100 text-indigo-600`}>📩</div>;
  if (type === "meeting_started")
    return <div className={`${base} bg-green-100 text-green-600`}>▶️</div>;
  if (type === "invitation_accepted")
    return <div className={`${base} bg-blue-100 text-blue-600`}>✅</div>;
  if (type === "invitation_rejected")
    return <div className={`${base} bg-red-100 text-red-600`}>❌</div>;
  return <div className={`${base} bg-gray-100 text-gray-500`}>🔔</div>;
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markOneRead } =
    useNotification();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (!open && unreadCount > 0) markAllRead();
  };

  const handleClickNoti = (noti) => {
    if (!noti.isRead) markOneRead(noti.notificationId);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative flex cursor-pointer transform hover:scale-120 items-center justify-center w-11 h-11  text-gray-700 rounded-lg hover:text-white transition"
        aria-label="Thông báo"
      >
        <Bell className="" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-800 text-sm">
              Thông báo
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 transition"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2 text-gray-400">
                <Bell className="w-8 h-8 opacity-30" />
                <span className="text-sm">Không có thông báo nào</span>
              </div>
            ) : (
              notifications.map((noti) => (
                <button
                  key={noti.notificationId}
                  onClick={() => handleClickNoti(noti)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition ${
                    !noti.isRead ? "bg-indigo-50" : "bg-white"
                  }`}
                >
                  <NotiIcon type={noti.type} />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${
                        !noti.isRead
                          ? "text-gray-900 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {noti.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {timeAgo(noti.createdAt)}
                    </p>
                  </div>
                  {!noti.isRead && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
