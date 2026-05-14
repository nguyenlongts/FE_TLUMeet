import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useMeetingCalendar } from "../../hooks/useMeetingCalendar";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

// Tạo danh sách ngày đúng cho tháng/năm
function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Đổi sang Monday-first
  const startOffset = (firstDay + 6) % 7;
  return { daysInMonth, startOffset };
}

const CalendarPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  const { meetingsByDate, loading } = useMeetingCalendar();

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

  const { daysInMonth, startOffset } = buildCalendarDays(
    currentYear,
    currentMonth,
  );

  const getMeetingsForDay = (day) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return meetingsByDate[dateKey] || [];
  };

  const isToday = (day) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const selectedMeetings = selectedDate ? getMeetingsForDay(selectedDate) : [];
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 mx-auto max-w-7xl flex gap-6">
        {/* Calendar */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-400" />
              </button>
              <h1 className="text-2xl font-bold text-white">
                {MONTHS[currentMonth]} {currentYear}
              </h1>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                Của tôi
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
                Được mời
              </span>
            </div>
          </div>

          {/* Grid */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-3">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-semibold text-slate-400 py-2"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Date cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Offset ô trống */}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Các ngày */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                (day) => {
                  const meetings = getMeetingsForDay(day);
                  const hostCount = meetings.filter(
                    (m) => m.calendarType === "host",
                  ).length;
                  const invitedCount = meetings.filter(
                    (m) => m.calendarType === "invited",
                  ).length;
                  const isSelected = selectedDate === day;

                  return (
                    <div
                      key={day}
                      onClick={() =>
                        setSelectedDate(day === selectedDate ? null : day)
                      }
                      className={`
                      aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl
                      border cursor-pointer transition-all text-sm
                      ${isToday(day) ? "border-purple-500 bg-purple-500/10" : "border-slate-700/30 hover:border-slate-600/50"}
                      ${isSelected ? "ring-2 ring-purple-400" : ""}
                    `}
                    >
                      <span
                        className={`font-semibold ${isToday(day) ? "text-purple-300" : "text-white"}`}
                      >
                        {day}
                      </span>

                      {/* Dots */}
                      {meetings.length > 0 && (
                        <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                          {hostCount > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          )}
                          {invitedCount > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          )}
                        </div>
                      )}

                      {/* Badge tổng số */}
                      {meetings.length > 0 && (
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {meetings.length}
                        </span>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>

        {/* Sidebar — chi tiết ngày được chọn */}
        <div className="w-72 shrink-0">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 sticky top-0">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">
              {selectedDate
                ? `${String(selectedDate).padStart(2, "0")} ${MONTHS[currentMonth]}`
                : "Chọn một ngày"}
            </h2>

            {loading && <p className="text-slate-500 text-xs">Đang tải...</p>}

            {!loading && selectedDate && selectedMeetings.length === 0 && (
              <p className="text-slate-500 text-xs">Không có cuộc họp nào.</p>
            )}

            <div className="flex flex-col gap-2">
              {selectedMeetings.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl border text-sm ${
                    m.calendarType === "host"
                      ? "border-purple-500/30 bg-purple-500/10"
                      : "border-blue-400/30 bg-blue-400/10"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        m.calendarType === "host"
                          ? "bg-purple-500"
                          : "bg-blue-400"
                      }`}
                    />
                    <span className="text-xs text-slate-400">
                      {m.calendarType === "host" ? "Của tôi" : "Được mời"}
                    </span>
                  </div>
                  <p className="font-medium text-white truncate">{m.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(m.scheduledDateTime).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" — "}
                    {m.duration} phút
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {m.roomCode}
                  </p>
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
