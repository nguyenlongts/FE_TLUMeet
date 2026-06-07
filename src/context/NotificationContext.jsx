import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as signalR from "@microsoft/signalr";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { selectAccessToken } from "../redux/features/auth/authSlice";
import {
  getNotifications,
  markAllAsRead,
  markOneAsRead,
} from "../api/notificationApi";

const NotificationContext = createContext(null);
const HUB_URL = "http://localhost:5555/hubs/notification";

export const NotificationProvider = ({ children }) => {
  const token = useSelector(selectAccessToken);
  const isRestoring = useSelector((state) => state.auth.isRestoring);
  const isAuthenticated = !!token && !isRestoring;
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getNotifications(token);
      if (!res.ok) return;
      const data = await res.json();
      console.log(data, "noti"); // xem payload trông như thế nào
      setNotifications(Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []);
    } catch {}
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    fetchNotifications();
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    conn.on("ReceiveInvite", (payload) => {
      console.log("[SignalR] ReceiveInvite payload:", payload);
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

    conn.on("MeetingStarted", (data) => {
      console.log("[SignalR] Phòng đã bắt đầu:", data);
      setNotifications((prev) => [
        {
          notificationId: Date.now(),
          type: "MeetingStarted",
          title: `Phòng "${data.title}" đã bắt đầu`,
          payload: JSON.stringify(data),
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span>
              🔴 Phòng <b>{data.title}</b> đã bắt đầu
            </span>
            <button
              onClick={() => {
                navigate(data.joinLink);
                toast.dismiss(t.id);
              }}
              className="px-2 py-1 bg-purple-500 text-white text-xs rounded shrink-0"
            >
              Tham gia ngay
            </button>
          </div>
        ),
        { duration: 10000 },
      );
    });
    conn.on("ReceiveInviteResponse", (payload) => {
      const statusLabel =
        payload.status === "Accepted" ? "chấp nhận" : "từ chối";
      setNotifications((prev) => [
        {
          notificationId: Date.now(),
          type: "MeetingInviteResponse",
          title: `${payload.inviteeEmail} đã ${statusLabel} lời mời — Phòng ${payload.roomCode}`,
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
