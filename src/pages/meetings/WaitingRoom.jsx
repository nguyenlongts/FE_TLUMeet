import React, { useState, useEffect, useCallback, useRef } from "react";
import { Clock, AlertCircle, X } from "lucide-react";
import { useLazyGetStatusMeetingQuery } from "../../redux/features/meetings/meetingsApi";
import { useTranslation } from "react-i18next";

const API_BASE = `http://localhost:5555/api/meeting`

function WaitingRoom({ roomCode, userName, onHostJoined, onCancel }) {
  const { t } = useTranslation();
  const [waitingTime, setWaitingTime] = useState(0);
  const hasJoined = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const checkHostStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/${roomCode}/status`);
        if (!response.ok || cancelled) return;
        const result = await response.json();
        if (result.statusCode === 200 && result.data?.status === "Live") {
          if (!hasJoined.current) {
            hasJoined.current = true;
            onHostJoined();
          }
        }
      } catch (error) {
        console.error("Error checking host status:", error);
      }
    };

    checkHostStatus();
    const interval = setInterval(checkHostStatus, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [roomCode, onHostJoined]);

  useEffect(() => {
    const timer = setInterval(() => setWaitingTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden border border-white/10"
        style={{ background: "#1a1d2e" }}
      >
        {/* Header */}
        <div
          className="relative flex flex-col items-center gap-3 px-6 py-8"
          style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
          >
            <X size={14} />
          </button>

          {/* Pulse icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
            <div className="relative w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Clock size={28} color="white" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-white font-semibold text-lg">{t('waitingRoom.title')}</p>
            <p className="text-white/70 text-sm mt-1">
              {t('waitingRoom.subtitle')}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-6">
          {/* Timer */}
          <div
            className="flex flex-col items-center gap-1 rounded-xl py-5 border border-white/10"
            style={{ background: "rgba(168,85,247,0.08)" }}
          >
            <p className="text-xs uppercase tracking-wider text-purple-400">
              {t('waitingRoom.waitTime')}
            </p>
            <p
              className="text-4xl font-bold tabular-nums"
              style={{ color: "#a855f7" }}
            >
              {formatTime(waitingTime)}
            </p>
          </div>

          {/* Info rows */}
          <div className="flex flex-col gap-2">
            <div
              className="flex items-center justify-between rounded-lg px-4 py-3 border border-white/10"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <span className="text-sm text-white/50">{t('waitingRoom.roomCode')}</span>
              <code className="text-sm font-mono font-bold text-purple-400">
                {roomCode}
              </code>
            </div>
            <div
              className="flex items-center justify-between rounded-lg px-4 py-3 border border-white/10"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <span className="text-sm text-white/50">{t('waitingRoom.yourName')}</span>
              <span className="text-sm font-medium text-white">{userName}</span>
            </div>
          </div>

          {/* Notice */}
          <div
            className="flex items-start gap-3 rounded-lg px-4 py-3 border border-purple-500/30"
            style={{ background: "rgba(168,85,247,0.08)" }}
          >
            <AlertCircle size={16} className="text-purple-400 mt-0.5 shrink-0" />
            <p className="text-sm text-white/60 leading-relaxed">
              {t('waitingRoom.notice')}
            </p>
          </div>

          {/* Cancel button */}
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-lg text-sm text-white/70 border border-white/15 hover:border-white/30 hover:text-white transition-colors"
          >
            {t('waitingRoom.leave')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WaitingRoom;