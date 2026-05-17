import { useMemo, useState } from "react";
import { Search, Video, Calendar, Clock, Pencil, Trash2, Plus, Users } from "lucide-react";
import { useDeleteMeetingApiMutation, useGetAllMeetingByEmailQuery, useGetMeetingInvitedQuery } from "../../redux/features/meetings/meetingsApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import MeetingCard from "../../components/MeetingCard";
import DeleteModal from "../../components/DeleteModal";
import toast from "react-hot-toast";
const AVATAR_COLORS = [
  "from-purple-500 to-violet-600",
  "from-orange-400 to-red-500",
  "from-teal-400 to-cyan-500",
  "from-pink-400 to-rose-500",
];
const MeetingPage = () => {
  const user=useSelector(selectCurrentUser)
  const {data:meetingsDataRaw,isLoading:isDataLoading}=useGetAllMeetingByEmailQuery(user.email)
  const {data:invitedDataRaw, isLoading: isInvitedDataLoading} = useGetMeetingInvitedQuery();
  const [deleteMeeting, {isLoading}]=useDeleteMeetingApiMutation()
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const meetings = useMemo(() => {
    const owned = meetingsDataRaw?.data ?? [];
    const invited = invitedDataRaw?.data ?? [];
    const merged = [...owned, ...invited];
    const seen = new Set();
    return merged.filter((m) => {
      if (seen.has(m._id)) return false;
      seen.add(m._id);
      return true;
    });
  }, [meetingsDataRaw, invitedDataRaw]);

  const filtered = meetings?.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );
  console.log(editTarget,"edt")
  const handleSave = (form) => {
    // setMeetings((prev) =>
    //   prev.map((m) => (m.id === editTarget.id ? { ...m, ...form, duration: Number(form.duration) } : m))
    // );
    // setEditTarget(null);
    console.log(form)
  };

  // const handleDelete =async () => {
  //   setMeetings((prev) => prev.filter((m) => m.id !== deleteTarget.id));
  //   setDeleteTarget(null);
  //   try {
  //     const res= await deleteMeeting(deleteTarget?.id).unwrap()
  //     setDeleteTarget(null)
  //     toast.success("Đã xóa phòng thành công")
  //   } catch (error) {
  //     console.log(error)
  //     toast.error("Xảy ra lỗi khi xóa phòng")
  //   }
  // };
  console.log(isDataLoading);
  
  if(isDataLoading) return <p className="text-white">Đang tải...</p>
  return (
    <div className="p-6 md:p-8 bg-[#12141f] overflow-y-auto h-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-white text-2xl font-semibold">Meetings</h1>
          <p className="text-white/40 text-sm mt-1">
            {meetings?.length} total · {meetings?.filter((m) => m.status === "upcoming")?.length} upcoming
          </p>
        </div>

        {/* New Meeting Button */}
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white self-start sm:self-auto"
          style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}>
          <Plus size={16} /> New Meeting
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search meetings by name..."
          className="w-full rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 border border-white/8 outline-none focus:border-purple-500 transition-colors"
          style={{ background: "#1e2235" }}
        />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-xs">
            ✕
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <MeetingCard
              key={m.id}
              meeting={m}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
            <Video size={24} className="text-white/20" />
          </div>
          <p className="text-white/40 text-sm">No meetings found for "{search}"</p>
        </div>
      )}

      {/* Modals */}
      {/* {editTarget && (
        <EditModal
          meeting={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSave}
        />
      )} */}
      {/* {deleteTarget && (
        <DeleteModal
          meeting={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )} */}
    </div>
  );
};

export default MeetingPage;