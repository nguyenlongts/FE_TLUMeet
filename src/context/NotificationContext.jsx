import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as signalR from "@microsoft/signalr";
import { useSelector } from "react-redux";
import { selectAccessToken } from "../redux/features/auth/authSlice";
import {
  getNotifications,
  markAllAsRead,
  markOneAsRead,
} from "../api/notificationApi";

const NotificationContext = createContext(null);

// SignalR hub URL — Notification Service port 5262
const HUB_URL = "http://localhost:5555/hubs/notification";

export const NotificationProvider = ({ children }) => {
  // Dùng Redux token (accessToken) thay vì AuthContext
  const token = useSelector(selectAccessToken);
  const isRestoring = useSelector((state) => state.auth.isRestoring);
  const isAuthenticated = !!token && !isRestoring;
  const [notifications, setNotifications] = useState([]);

  // ── Fetch từ REST API khi load ────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getNotifications(token);
      if (!res.ok) return;
      const data = await res.json();
      // BE trả về List<Notification> trực tiếp
      setNotifications(Array.isArray(data) ? data : []);
    } catch {}
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    fetchNotifications();
  }, [isAuthenticated, fetchNotifications]);

  // ── SignalR ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Invitee nhận lời mời mới — InviteNotificationDto:
    // { inviteId, roomCode, hostName, hostEmail, title, joinLink, expiresAt }
    conn.on("ReceiveInvite", (payload) => {
      setNotifications((prev) => [
        {
          notificationId: Date.now(),
          type: "MeetingInvite",
          title: `${payload.hostName} mời bạn vào: ${payload.title}`,
          payload: JSON.stringify(payload),
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    // Host nhận kết quả — InviteResponseDto:
    // { inviteId, roomCode, inviteeEmail, status }
    conn.on("ReceiveInviteResponse", (payload) => {
      const statusLabel =
        payload.status === "Accepted" ? "chấp nhận" : "từ chối";
      setNotifications((prev) => [
        {
          notificationId: Date.now(),
          type: "MeetingInviteResponse",
          title: `${payload.inviteeEmail} đã ${statusLabel} lời mời — phòng ${payload.roomCode}`,
          payload: JSON.stringify(payload),
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    conn
      .start()
      .catch((err) =>
        console.warn("[SignalR] Kết nối notification hub thất bại:", err),
      );

    return () => conn.stop();
  }, [isAuthenticated, token]);

  // ── Mark read ─────────────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    if (!token) return;
    try {
      await markAllAsRead(token);
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, [token]);

  const markOneRead = useCallback(
    async (id) => {
      if (!token) return;
      try {
        // id từ DB là số nguyên; id tạm từ SignalR là Date.now() (số lớn) — chỉ gọi API khi là ID DB hợp lệ
        if (typeof id === "number" && id < 1e12) {
          await markOneAsRead(id, token);
        }
      } catch {}
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n)),
      );
    },
    [token],
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllRead,
        markOneRead,
        refetch: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
