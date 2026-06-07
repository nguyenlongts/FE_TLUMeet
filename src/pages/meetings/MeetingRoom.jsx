import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {useSelector} from 'react-redux'
import { selectAccessToken, selectCurrentUser } from "../../redux/features/auth/authSlice";
import { useGenerateJaasTokenMutation } from "../../redux/features/jass/jaasApi";
import { useEndMeetingMutation } from "../../redux/features/meetings/meetingsApi";
import { useTranslation } from "react-i18next";

const JAAS_CONFIG = {
  appId:          "vpaas-magic-cookie-xxxxxxx",
  domain:         "8x8.vc",
  tokenUrl:       `${import.meta.env.VITE_API_URL}/jaas/generate-token`,
  meetingUrl:     `${import.meta.env.VITE_API_URL}/meeting`,
};


export default function MeetingRoom() {
  const { t } = useTranslation();
  const { roomName } = useParams();
  const navigate     = useNavigate();
  const token=useSelector(selectAccessToken);

  const user= useSelector(selectCurrentUser);
  const userGuest= sessionStorage.getItem('guestName')
  const userName = user?.name  || userGuest;
  const userEmail= user?.email || "guest@example.com";


  const [status, setStatus] = useState({
    loading:   true,   
    started:   false,
    needsHost: false,  
    error:     null,
  });
  const [isModerator,   setIsModerator]   = useState(false);
  const [jitsiReady,    setJitsiReady]    = useState(false);
  const [hostEnded,     setHostEnded]     = useState(false);
  const [hasJoined, setHasJoined]= useState(false);

  const containerRef    = useRef(null); 
  const apiRef          = useRef(null); 
  const initialized     = useRef(false);
  const navigated       = useRef(false);
  const pollRef         = useRef(null); 
  const hostPollRef     = useRef(null); 

  const tokenGuest=sessionStorage.getItem("joinToken")
  const authHeader = { Authorization: `Bearer ${token?token:tokenGuest}`};
  const [generateJaasToken] = useGenerateJaasTokenMutation()
  const [endMeeting] = useEndMeetingMutation()


  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${JAAS_CONFIG.meetingUrl}/${roomName}/status`, {
          headers: authHeader,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const { data } = await res.json();
        const isHost    = data.hostName === userEmail;
        const isStarted = data.status === "Live" || data.isStarted === true;
        console.log("Meeting status data:", {
          requireHostToStart: data.requireHostToStart,
          isStarted:         data.isStarted,
          status:            data.status,
          hostName:          data.hostName,
        })
        console.log(data, "datatv")

        setIsModerator(isHost);

        // Host chưa start → gọi API start
        if (isHost && !isStarted) {
          await fetch(`${JAAS_CONFIG.meetingUrl}/${roomName}/start`, {
            method: "POST",
            headers: authHeader,
          });
          setStatus({ loading: false, started: true, needsHost: false, error: null });
          return;
        }

        setStatus({
          loading:   false,
          started:   isStarted || !data.requireHostToStart,
          needsHost: data.requireHostToStart && !isStarted && !isHost,
          error:     null,
        });
      } catch (err) {
        setStatus(s => ({ ...s, loading: false, error: err.message }));
      }
    })();
  }, [roomName]);

  //cho bam start
  useEffect(() => {
    if (!status.needsHost) return;

    pollRef.current = setInterval(async () => {
      try {
        const res    = await fetch(`${JAAS_CONFIG.meetingUrl}/${roomName}/status`, {
          headers: authHeader,
        });
        const { data } = await res.json();
        if (data?.status === "Live" || data?.isStarted) {
          clearInterval(pollRef.current);
          setStatus(s => ({ ...s, started: true, needsHost: false }));
        }
      } catch (_) {}
    }, 3000);

    return () => clearInterval(pollRef.current);
  }, [status.needsHost, roomName]);

  // detect khi host end meeting
  useEffect(() => {
    if (isModerator || !hasJoined) return;
    let failCount=0;
    const MAX_FAIL=3; 
    hostPollRef.current = setInterval(async () => {
      try {
        const res    = await fetch(`${JAAS_CONFIG.meetingUrl}/${roomName}/status`, {
          headers: authHeader,
        });
        const { data } = await res.json();
        const stillLive = data?.status === "Live" || data?.isStarted;

        if (!stillLive) {
          failCount++;
          if(failCount>= MAX_FAIL){
            clearInterval(hostPollRef.current);
            setHostEnded(true);
            apiRef.current?.dispose();
            apiRef.current = null;
            setTimeout(() => goHome(), 2000);
          }
        }else{
          failCount=0;
        }
      } catch (_) {}
    }, 2000);

    return () => clearInterval(hostPollRef.current);
  }, [isModerator,hasJoined, roomName]);

  //load script jitsi, fetch token va init
  useEffect(() => {
    // Chỉ chạy khi phòng đã sẵn sàng
    if (status.loading || status.needsHost || !status.started) return;

    const loadAndInit = () => {
      if (window.JitsiMeetExternalAPI) { initJitsi(); return; }

      const script   = document.createElement("script");
      script.src     = `https://8x8.vc/${JAAS_CONFIG.appId}/external_api.js`;
      script.async   = true;
      script.onload  = initJitsi;
      script.onerror = () =>
        setStatus(s => ({ ...s, error: t('meetingRoom.jitsiLoadError') }));
      document.body.appendChild(script);
    };

    const initJitsi = async () => {
      // Guard: chỉ init 1 lần
      if (initialized.current || apiRef.current || !containerRef.current) return;
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
          roomName:   roomFullName,
          width:      "100%",
          height:     "100%",
          parentNode: containerRef.current,
          ...(jaasToken && { jwt: jaasToken }),
          userInfo:   { displayName: userName },
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            prejoinPageEnabled:  false,
            enableWelcomePage:   false,
            disableDeepLinking:  true,
            inviteUrl:           `${window.location.origin}/meet/${roomName}`,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK:      false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            MOBILE_APP_PROMO:          false,
          },
        });

        const iframe = apiRef.current.getIFrame();
        iframe.onload = () => setJitsiReady(true);
        // 3) Events
        apiRef.current.addEventListener("videoConferenceJoined", () => {
          setJitsiReady(true);
          setHasJoined(true);
          try {
            apiRef.current?.executeCommand("overwriteConfig", {
              inviteUrl: `${window.location.origin}/meet/${roomName}`,
            });
          } catch (_) {}
        });


        apiRef.current.addEventListener("videoConferenceLeft", async () => {
          if (isModerator) {
            await endMeeting(roomName).catch(() => {});
          }
          goHome();
        });

        apiRef.current.addEventListener("readyToClose", goHome);

      } catch (err) {
        const msg = err?.data?.error || err?.data?.message || err?.message || "Không thể khởi tạo phòng họp";
        setStatus(s => ({ ...s, error: msg }));
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
    };
  }, []);

  const goHome = () => {
    if (navigated.current) return;
    navigated.current = true;
    sessionStorage.removeItem("guestName"); 
    sessionStorage.removeItem("joinToken"); 
    navigate(user ? "/dashboard" : "/");
  };


  // Host đã end meeting
  if (hostEnded) return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-xl text-gray-600">{t('meetingRoom.hostEnded')}</p>
    </div>
  );


  if (status.needsHost) return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-gray-500">{t('meetingRoom.waitingHost')}</p>
    </div>
  );


  if (status.error) return (
    <div className="h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-red-500">{status.error}</p>
      <button onClick={() => window.location.reload()}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
        {t('meetingRoom.retry')}
      </button>
    </div>
  );
  console.log(jitsiReady,"jitsiready");
  console.log(status.error, "stter")
  
  return (
    <div className="w-screen h-screen bg-gray-900 relative">

      <div ref={containerRef} className="absolute inset-0" />


      {!jitsiReady && !status.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90">
          <div className="text-center text-white">
            <div className="animate-spin h-12 w-12 border-b-2 border-indigo-400 rounded-full mx-auto mb-4" />
            <p>{t('meetingRoom.loadingRoom')}</p>
            <p>{status.error}</p>
            <p className="text-sm text-gray-400 mt-1">{roomName}</p>
          </div>
        </div>
      )}
    </div>
  );
}