import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectAccessToken,
  selectCurrentUser,
} from "../../redux/features/auth/authSlice";
import { useGenerateJaasTokenMutation } from "../../redux/features/jass/jaasApi";
import { useEndMeetingMutation, useLeaveMeetingMutation } from "../../redux/features/meetings/meetingsApi";
import { useTranslation } from "react-i18next";
import {
  setActiveMeeting,
  clearActiveMeeting,
} from "../../utils/activeMeeting";
import * as signalR from "@microsoft/signalr";
import WaitingForHost from "./WaitingForHost";

// Hub thông báo nằm ở /hubs/notification (không thuộc /api của VITE_API_URL)
const HUB_URL = `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")}/hubs/notification`;

const JAAS_CONFIG = {
  appId: "vpaas-magic-cookie-xxxxxxx",
  domain: "8x8.vc",
  tokenUrl: `${import.meta.env.VITE_API_URL}/jaas/generate-token`,
  meetingUrl: `${import.meta.env.VITE_API_URL}/meeting`,
};

export default function MeetingRoom() {
  const { t } = useTranslation();
  const { roomName } = useParams();
  const navigate = useNavigate();
  const token = useSelector(selectAccessToken);

  const user = useSelector(selectCurrentUser);
  const userGuest = sessionStorage.getItem("guestName");
  const userName = user?.name || userGuest;
  const userEmail = user?.email || "guest@example.com";

  const [status, setStatus] = useState({
    loading: true,
    started: false,
    needsHost: false,
    error: null,
  });
  const [isModerator, setIsModerator] = useState(false);
  const [jitsiReady, setJitsiReady] = useState(false);
  const [hostEnded, setHostEnded] = useState(false);

  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const initialized = useRef(false);
  const navigated = useRef(false);
  const connRef = useRef(null); // kết nối SignalR cho sự kiện vòng đời phòng
  const isModeratorRef = useRef(false); // đọc trạng thái host mới nhất trong handler SignalR

  const tokenGuest = sessionStorage.getItem("joinToken");
  const authHeader = { Authorization: `Bearer ${token ? token : tokenGuest}` };
  const [generateJaasToken] = useGenerateJaasTokenMutation();
  const [endMeeting] = useEndMeetingMutation();
  const [leaveMeeting] = useLeaveMeetingMutation();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${JAAS_CONFIG.meetingUrl}/${roomName}/status`,
          {
            headers: authHeader,
          },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const { data } = await res.json();
        const isHost = data.hostName === userEmail;
        const isStarted = data.status === "Live" || data.isStarted === true;
        console.log("Meeting status data:", {
          requireHostToStart: data.requireHostToStart,
          isStarted: data.isStarted,
          status: data.status,
          hostName: data.hostName,
        });
        console.log(data, "datatv");

        setIsModerator(isHost);
        isModeratorRef.current = isHost;

        // Host chưa start → gọi API start
        if (isHost && !isStarted) {
          await fetch(`${JAAS_CONFIG.meetingUrl}/${roomName}/start`, {
            method: "POST",
            headers: authHeader,
          });
          setStatus({
            loading: false,
            started: true,
            needsHost: false,
            error: null,
          });
          return;
        }

        setStatus({
          loading: false,
          started: isStarted || !data.requireHostToStart,
          needsHost: data.requireHostToStart && !isStarted && !isHost,
          error: null,
        });
      } catch (err) {
        setStatus((s) => ({ ...s, loading: false, error: err.message }));
      }
    })();
  }, [roomName]);

  // Realtime vòng đời phòng (bắt đầu/kết thúc) qua SignalR — thay cho polling.
  // Tham gia group "meeting:{roomCode}" để nhận sự kiện dù là khách hay người được mời.
  useEffect(() => {
    if (!roomName) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, token ? { accessTokenFactory: () => token } : {})
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();
    connRef.current = conn;

    const handleEnded = () => {
      if (isModeratorRef.current) return; // host tự kết thúc → không cần xử lý
      setHostEnded(true);
      apiRef.current?.dispose();
      apiRef.current = null;
      setTimeout(() => goHome(), 2000);
    };

    const sameRoom = (rc) => !rc || rc.toLowerCase() === roomName.toLowerCase();

    conn.on("MeetingStarted", (data) => {
      console.log("[MeetingRoom] SignalR MeetingStarted:", data);
      if (!sameRoom(data?.roomCode)) return;
      setStatus((s) => ({
        ...s,
        loading: false,
        started: true,
        needsHost: false,
      }));
    });

    conn.on("MeetingEnded", (data) => {
      console.log(
        "[MeetingRoom] SignalR MeetingEnded:",
        data,
        "isModerator:",
        isModeratorRef.current,
      );
      if (!sameRoom(data?.roomCode)) return;
      handleEnded();
    });

    const joinGroup = () =>
      conn
        .invoke("JoinMeetingGroup", roomName)
        .then(() =>
          console.log("[MeetingRoom] joined group meeting:" + roomName),
        )
        .catch((e) =>
          console.warn("[MeetingRoom] JoinMeetingGroup failed:", e),
        );

    // Sau khi reconnect phải join lại group (group membership mất khi rớt kết nối)
    conn.onreconnected(joinGroup);

    conn
      .start()
      .then(async () => {
        console.log("[MeetingRoom] hub connected:", HUB_URL);
        await joinGroup();
        // Bắt kịp trạng thái nếu phòng đổi giữa lúc fetch ban đầu và lúc join group
        try {
          const res = await fetch(
            `${JAAS_CONFIG.meetingUrl}/${roomName}/status`,
            {
              headers: authHeader,
            },
          );
          const { data } = await res.json();
          if (data?.status === "Ended") handleEnded();
          else if (data?.status === "Live" || data?.isStarted)
            setStatus((s) => ({
              ...s,
              loading: false,
              started: true,
              needsHost: false,
            }));
        } catch (_) {}
      })
      .catch((err) => console.warn("[MeetingRoom] Kết nối hub thất bại:", err));

    return () => {
      conn.invoke("LeaveMeetingGroup", roomName).catch(() => {});
      conn.stop();
      connRef.current = null;
    };
  }, [roomName, token]);

  //load script jitsi, fetch token va init
  useEffect(() => {
    // Chỉ chạy khi phòng đã sẵn sàng
    if (status.loading || status.needsHost || !status.started) return;

    const loadAndInit = () => {
      if (window.JitsiMeetExternalAPI) {
        initJitsi();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://8x8.vc/${JAAS_CONFIG.appId}/external_api.js`;
      script.async = true;
      script.onload = initJitsi;
      script.onerror = () =>
        setStatus((s) => ({ ...s, error: t("meetingRoom.jitsiLoadError") }));
      document.body.appendChild(script);
    };

    const initJitsi = async () => {
      // Guard: chỉ init 1 lần
      if (initialized.current || apiRef.current || !containerRef.current)
        return;
      initialized.current = true;

      try {
        let roomFullName, jaasToken;

        if (isModerator) {
          // Host: lấy JAAS JWT từ backend
          const res = await generateJaasToken({
            roomName,
            userName,
            email: userEmail || "",
            isModerator: true,
            avatarUrl: "",
            expiresInMinutes: 120,
          }).unwrap();
          roomFullName = `${res.appId}/${res.roomName}`;
          jaasToken = res.token;
        } else {
          // Guest: lấy JWT từ backend với isModerator: false để có đúng appId
          const res = await generateJaasToken({
            roomName,
            userName: userName || "Guest",
            email: userEmail,
            isModerator: false,
            avatarUrl: "",
            expiresInMinutes: 120,
          }).unwrap();
          roomFullName = `${res.appId}/${res.roomName}`;
          jaasToken = res.token;
        }

        // Khởi tạo Jitsi
        apiRef.current = new window.JitsiMeetExternalAPI(JAAS_CONFIG.domain, {
          roomName: roomFullName,
          width: "100%",
          height: "100%",
          parentNode: containerRef.current,
          ...(jaasToken && { jwt: jaasToken }),
          userInfo: { displayName: userName },
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            prejoinPageEnabled: false,
            enableWelcomePage: false,
            disableDeepLinking: true,
            inviteUrl: `${window.location.origin}/meet/${roomName}`,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            MOBILE_APP_PROMO: false,
          },
        });

        const iframe = apiRef.current.getIFrame();
        iframe.onload = () => setJitsiReady(true);
        // 3) Events
        apiRef.current.addEventListener("videoConferenceJoined", () => {
          setJitsiReady(true);
          setActiveMeeting(roomName);
          try {
            apiRef.current?.executeCommand("overwriteConfig", {
              inviteUrl: `${window.location.origin}/meet/${roomName}`,
            });
          } catch (_) {}
        });

        apiRef.current.addEventListener("videoConferenceLeft", async () => {
          if (isModerator) {
            // Host rời → end meeting (qua RTK để invalidate cache "Meetings")
            await endMeeting(roomName)
              .unwrap()
              .catch(() => {});
          } else {
            // Người tham gia rời → cập nhật LeftAt (điểm danh)
            const joinToken = sessionStorage.getItem("joinToken");
            if (joinToken) {
              await leaveMeeting(joinToken)
                .unwrap()
                .catch(() => {});
            }
          }
          goHome();
        });

        apiRef.current.addEventListener("readyToClose", goHome);
      } catch (err) {
        const msg =
          err?.data?.error ||
          err?.data?.message ||
          err?.message ||
          "Không thể khởi tạo phòng họp";
        setStatus((s) => ({ ...s, error: msg }));
        console.log(err);
      }
    };

    loadAndInit();
  }, [status.loading, status.needsHost, status.started]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      apiRef.current?.dispose();
      apiRef.current = null;
      clearActiveMeeting();
    };
  }, []);

  // Đóng tab / refresh → cập nhật LeftAt qua sendBeacon (vẫn gửi được khi trang đang đóng)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const joinToken = sessionStorage.getItem("joinToken");
      if (!joinToken) return;
      // POST không body + tham số trên query → "simple request", không bị CORS preflight
      // (preflight không kịp hoàn tất khi trang đang đóng)
      navigator.sendBeacon(
        `${import.meta.env.VITE_API_URL}/meeting/leave-beacon?joinToken=${encodeURIComponent(joinToken)}`,
      );
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const goHome = () => {
    if (navigated.current) return;
    navigated.current = true;
    sessionStorage.removeItem("guestName");
    sessionStorage.removeItem("joinToken");
    clearActiveMeeting();
    navigate(user ? "/dashboard" : "/");
  };

  // Host đã end meeting
  if (hostEnded)
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">{t("meetingRoom.hostEnded")}</p>
      </div>
    );

  if (status.needsHost)
    return (
      <WaitingForHost
        roomCode={roomName}
        userName={userName}
        onLeave={goHome}
      />
    );

  if (status.error)
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-red-500">{status.error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-[var(--content)] rounded-lg"
        >
          {t("meetingRoom.retry")}
        </button>
      </div>
    );
  console.log(jitsiReady, "jitsiready");
  console.log(status.error, "stter");

  return (
    <div className="w-screen h-screen bg-gray-900 relative">
      <div ref={containerRef} className="absolute inset-0" />

      {!jitsiReady && !status.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90">
          <div className="text-center text-[var(--content)]">
            <div className="animate-spin h-12 w-12 border-b-2 border-indigo-400 rounded-full mx-auto mb-4" />
            <p>{t("meetingRoom.loadingRoom")}</p>
            <p>{status.error}</p>
            <p className="text-sm text-gray-400 mt-1">{roomName}</p>
          </div>
        </div>
      )}
    </div>
  );
}
