import { useState, useEffect, useCallback } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

// Màn hình toàn trang khi vào /meet/:roomCode mà host chưa bắt đầu.
// Không tự polling — việc host bắt đầu được đẩy realtime qua SignalR (MeetingRoom).
export default function WaitingForHost({ roomCode, userName, onLeave }) {
  const { t } = useTranslation();
  const [waitingTime, setWaitingTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setWaitingTime((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]">
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden border border-[var(--line)]"
        style={{ background: "var(--surface)" }}
      >
        {/* Header */}
        <div
          className="relative flex flex-col items-center gap-3 px-6 py-8"
          style={{ background: "var(--accent)" }}
        >
          {/* Pulse icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
            <div className="relative w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Clock size={28} color="white" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-white font-semibold text-lg">{t("waitingRoom.title")}</p>
            <p className="text-white/70 text-sm mt-1">{t("waitingRoom.subtitle")}</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-6">
          {/* Timer */}
          <div className="flex flex-col items-center gap-1 rounded-xl py-5 border border-[var(--line)] bg-[var(--accent)]/[0.08]">
            <p className="text-xs uppercase tracking-wider text-[var(--accent-fg)]">
              {t("waitingRoom.waitTime")}
            </p>
            <p className="text-4xl font-bold tabular-nums text-[var(--accent-fg)]">
              {formatTime(waitingTime)}
            </p>
          </div>

          {/* Info rows */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-lg px-4 py-3 border border-[var(--line)] bg-[var(--overlay)]">
              <span className="text-sm text-[var(--content)]/50">{t("waitingRoom.roomCode")}</span>
              <code className="text-sm font-mono font-bold text-[var(--accent-fg)]">{roomCode}</code>
            </div>
            {userName && (
              <div className="flex items-center justify-between rounded-lg px-4 py-3 border border-[var(--line)] bg-[var(--overlay)]">
                <span className="text-sm text-[var(--content)]/50">{t("waitingRoom.yourName")}</span>
                <span className="text-sm font-medium text-[var(--content)]">{userName}</span>
              </div>
            )}
          </div>

          {/* Notice */}
          <div className="flex items-start gap-3 rounded-lg px-4 py-3 border border-[var(--accent)]/30 bg-[var(--accent)]/[0.08]">
            <AlertCircle size={16} className="text-[var(--accent-fg)] mt-0.5 shrink-0" />
            <p className="text-sm text-[var(--content)]/60 leading-relaxed">
              {t("waitingRoom.notice")}
            </p>
          </div>

          {/* Leave button */}
          <button
            onClick={onLeave}
            className="w-full py-3 rounded-lg text-sm text-[var(--content)]/70 border border-[var(--line)] hover:text-[var(--content)] transition-colors"
          >
            {t("waitingRoom.leave")}
          </button>
        </div>
      </div>
    </div>
  );
}
