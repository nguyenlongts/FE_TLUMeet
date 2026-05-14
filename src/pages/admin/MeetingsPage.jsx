import React, { useState, useEffect } from "react";
import {
  Search,
  Video,
  Lock,
  Activity,
  Clock,
  StopCircle,
  Trash2,
} from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

const API_BASE = "https://kiritsu2210-001-site1.rtempurl.com/api";

function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/Admin/meetings`);
      const result = await response.json();
      if (result.returnCode === 200) {
        setMeetings(result.data);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/Admin/meetings/${selectedMeetingId}`,
        { method: "DELETE" }
      );
      const result = await response.json();
      if (result.returnCode === 200) {
        fetchMeetings();
      }
    } catch (error) {
      console.error("Error deleting meeting:", error);
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleForceEndMeeting = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/Admin/meetings/${selectedMeetingId}/force-end`,
        { method: "POST" }
      );
      const result = await response.json();
      if (result.returnCode === 200) {
        fetchMeetings();
      }
    } catch (error) {
      console.error("Error ending meeting:", error);
    } finally {
      setConfirmOpen(false);
    }
  };

  const filteredMeetings = meetings.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.roomCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.hostName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMeetings.length / pageSize);
  const paginatedMeetings = filteredMeetings?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm meeting theo tiêu đề, mã phòng hoặc host..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2D8CFF]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  "ID",
                  "Tiêu đề",
                  "Mã phòng",
                  "Host",
                  "Ngày",
                  "Thời lượng",
                  "Trạng thái",
                  "Thao tác",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedMeetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{meeting.id}</td>
                  <td className="px-6 py-4 font-medium">{meeting.title}</td>
                  <td className="px-6 py-4">
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {meeting.roomCode}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm">{meeting.hostName}</td>
                  <td className="px-6 py-4 text-sm">
                    {meeting.scheduledDate
                      ? new Date(meeting.scheduledDate).toLocaleDateString(
                          "vi-VN"
                        )
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm">{meeting.duration} phút</td>
                  <td className="px-6 py-4">
                    {meeting.isStarted ? (
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                        Đang diễn ra
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-xs">
                        Chưa bắt đầu
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {meeting.isStarted && (
                        <button
                          onClick={() => {
                            setSelectedMeetingId(meeting.id);
                            setConfirmType("force-end");
                            setConfirmOpen(true);
                          }}
                          className="p-2 bg-orange-100 text-orange-600 rounded-lg"
                        >
                          <StopCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedMeetingId(meeting.id);
                          setConfirmType("delete");
                          setConfirmOpen(true);
                        }}
                        className="p-2 bg-red-100 text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination + Page size */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border rounded px-2 py-1 focus:ring-2 focus:ring-[#2D8CFF]"
              >
                {[5, 8, 10, 20].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span>mục / trang</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:text-gray-400"
              >
                Trước
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1 ? "bg-[#2D8CFF] text-white" : "border"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:text-gray-400"
              >
                Sau
              </button>
            </div>
          </div>
        )}

        {filteredMeetings.length === 0 && (
          <div className="p-12 text-center">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy meeting nào</p>
          </div>
        )}

        <ConfirmModal
          open={confirmOpen}
          danger={confirmType === "delete"}
          title={confirmType === "delete" ? "Xóa meeting" : "Kết thúc meeting"}
          message={
            confirmType === "delete"
              ? "Meeting sẽ bị xóa vĩnh viễn."
              : "Meeting sẽ bị kết thúc ngay."
          }
          confirmText={confirmType === "delete" ? "Xóa" : "Kết thúc"}
          onClose={() => setConfirmOpen(false)}
          onConfirm={
            confirmType === "delete"
              ? handleDeleteMeeting
              : handleForceEndMeeting
          }
        />
      </div>
    </div>
  );
}

export default MeetingsPage;
