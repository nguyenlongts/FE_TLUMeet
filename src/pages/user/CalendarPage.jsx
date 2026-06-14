import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMeetingCalendar } from "../../hooks/useMeetingCalendar";
import Loading from "../../components/Loading";

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay + 6) % 7;
  return { daysInMonth, startOffset };
}

// Backend trả status dạng số hoặc chuỗi → chuẩn hóa về nhãn chuỗi (như MeetingCard).
const STATUS_BY_CODE = { 0: "Scheduled", 1: "WaitingForHost", 2: "Live", 3: "Ended" };
const normalizeStatus = (status) =>
  typeof status === "number" ? STATUS_BY_CODE[status] ?? "Scheduled" : status ?? "Scheduled";

const STATUS_COLOR = {
  Scheduled: "text-[var(--accent-fg)] bg-[var(--accent)]/15",
  WaitingForHost: "text-yellow-700 dark:text-yellow-300 bg-yellow-500/15",
  Live: "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15",
  Ended: "text-red-700 dark:text-red-300 bg-red-500/15",
};

const CalendarPage = () => {
  const { t } = useTranslation();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  const { meetingsByDate, loading } = useMeetingCalendar();

  const DAYS = t("calendar.days", { returnObjects: true });
  const MONTHS = t("calendar.months", { returnObjects: true });

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const { daysInMonth, startOffset } = buildCalendarDays(currentYear, currentMonth);

  const getMeetingsForDay = (day) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return meetingsByDate[dateKey] || [];
  };

  const isToday = (day) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const selectedMeetings = selectedDate ? getMeetingsForDay(selectedDate) : [];

  if (loading) return <Loading text={t("calendar.loading")} />;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4 sm:p-8 mx-auto max-w-7xl flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-[var(--surface-hover,var(--surface))] transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[var(--muted)]" />
              </button>
              <h1 className="text-2xl font-bold text-[var(--content)]">
                {MONTHS[currentMonth]} {currentYear}
              </h1>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-[var(--surface-hover,var(--surface))] transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[var(--muted)]" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
                {t("calendar.legend.mine")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
                {t("calendar.legend.invited")}
              </span>
            </div>
          </div>

          {/* Grid */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-3">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-semibold text-[var(--muted)] py-2"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Date cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const meetings = getMeetingsForDay(day);
                const hostCount = meetings.filter((m) => m.calendarType === "host").length;
                const invitedCount = meetings.filter((m) => m.calendarType === "invited").length;
                const isSelected = selectedDate === day;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(day === selectedDate ? null : day)}
                    className={`
                      aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl
                      border cursor-pointer transition-all text-sm
                      ${isToday(day) ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--line)] hover:border-[var(--accent)]/40"}
                      ${isSelected ? "ring-2 ring-[var(--accent-fg)]" : ""}
                    `}
                  >
                    <span className={`font-semibold ${isToday(day) ? "text-[var(--accent-fg)]" : "text-[var(--content)]"}`}>
                      {day}
                    </span>

                    {meetings.length > 0 && (
                      <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                        {hostCount > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                        )}
                        {invitedCount > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        )}
                      </div>
                    )}

                    {meetings.length > 0 && (
                      <span className="text-[10px] text-[var(--muted)] mt-0.5">
                        {meetings.length}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 sticky top-0">
            <h2 className="text-sm font-semibold text-[var(--muted)] mb-3">
              {selectedDate
                ? `${String(selectedDate).padStart(2, "0")} ${MONTHS[currentMonth]}`
                : t("calendar.sidebar.selectPrompt")}
            </h2>

            {loading && (
              <p className="text-[var(--faint)] text-xs">{t("calendar.sidebar.loading")}</p>
            )}

            {!loading && selectedDate && selectedMeetings.length === 0 && (
              <p className="text-[var(--faint)] text-xs">{t("calendar.sidebar.noMeetings")}</p>
            )}

            <div className="flex flex-col gap-2">
              {selectedMeetings.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl border text-sm ${
                    m.calendarType === "host"
                      ? "border-violet-500/30 bg-violet-500/10"
                      : "border-blue-400/30 bg-blue-400/10"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        m.calendarType === "host" ? "bg-violet-500" : "bg-blue-400"
                      }`}
                    />
                    <span className="text-xs text-[var(--muted)]">
                      {m.calendarType === "host"
                        ? t("calendar.sidebar.mine")
                        : t("calendar.sidebar.invited")}
                    </span>
                    {(() => {
                      const status = normalizeStatus(m.status);
                      // Host thấy "Chờ bắt đầu", người được mời thấy "Chờ chủ phòng"
                      const displayStatus =
                        status === "WaitingForHost" && m.calendarType === "host"
                          ? "WaitingToStart"
                          : status;
                      return (
                        <span
                          className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            STATUS_COLOR[status] || "text-[var(--content)]/50 bg-[var(--overlay)]"
                          }`}
                        >
                          {t(`meetingCard.status.${displayStatus}`, displayStatus)}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="font-medium text-[var(--content)] truncate">{m.title}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {new Date(m.scheduledDateTime).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" — "}
                    {t("calendar.sidebar.duration", { duration: m.duration })}
                  </p>
                  <p className="text-xs text-[var(--faint)] font-mono mt-0.5">{m.roomCode}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;