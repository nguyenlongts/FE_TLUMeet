import React, { useState, useEffect } from "react";
function EditMeetingModal({ meeting, onClose, onUpdated }) {
  const [form, setForm] = useState({
    title: meeting.title || "",
    description: meeting.description || "",
    scheduledDate: meeting.scheduledDate
      ? meeting.scheduledDate.split("T")[0]
      : "",
    scheduledTime: meeting.scheduledTime || "",
    duration: meeting.duration || 0,
  });
  useEffect(() => {
    if (!meeting) return;

    setForm({
      title: meeting.title || "",
      description: meeting.description || "",
      scheduledDate: meeting.scheduledDateRaw
        ? meeting.scheduledDateRaw.split("T")[0]
        : "",
      scheduledTime: meeting.scheduledTimeRaw || "",
      duration: meeting.durationRaw || "",
    });
  }, [meeting]);
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        "https://kiritsu2210-001-site1.rtempurl.com/api/Meeting",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomCode: meeting.roomCode,
            title: form.title,
            description: form.description,
            scheduledDate: new Date(form.scheduledDate).toISOString(),
            scheduledTime: form.scheduledTime,
            duration: Number(form.duration),
          }),
        }
      );

      const data = await res.json();

      if (data.returnCode === 200) {
        alert("Cập nhật phòng họp thành công!");
        onUpdated();
        onClose();
      } else {
        alert(data.message || "Cập nhật thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi cập nhật phòng họp");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Cập nhật phòng họp</h2>

        <input
          className="w-full mb-3 p-2 border rounded"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Tiêu đề"
        />

        <textarea
          className="w-full mb-3 p-2 border rounded"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Mô tả"
        />

        <input
          type="date"
          className="w-full mb-3 p-2 border rounded"
          value={form.scheduledDate}
          onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
        />

        <input
          type="time"
          className="w-full mb-3 p-2 border rounded"
          value={form.scheduledTime}
          onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
        />

        <input
          type="number"
          className="w-full mb-4 p-2 border rounded"
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
          placeholder="Thời lượng (phút)"
        />

        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditMeetingModal;
