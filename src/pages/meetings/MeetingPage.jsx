import { useMemo, useState } from "react";
import { Search, Video, Plus } from "lucide-react";
import {
  useDeleteMeetingApiMutation,
  useGetAllMeetingByEmailQuery,
  useGetMeetingInvitedQuery,
} from "../../redux/features/meetings/meetingsApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import MeetingCard from "../../components/MeetingCard";
import ScheduleMeetingModal from "./ScheduleMeetingModal";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const MeetingPage = () => {
  const { t } = useTranslation();
  const user = useSelector(selectCurrentUser);

  const { data: meetingsDataRaw, isLoading: isDataLoading } =
    useGetAllMeetingByEmailQuery(user?.email, {
      skip: !user?.email, // ✅ Không gọi API nếu chưa có email
    });

  const { data: invitedDataRaw, isLoading: isInvitedDataLoading } =
    useGetMeetingInvitedQuery();

  const [deleteMeeting] = useDeleteMeetingApiMutation();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  // ✅ useMemo không bị lỗi vì dùng optional chaining
  const meetings = useMemo(() => {
    const owned = meetingsDataRaw?.data ?? [];
    const invited = invitedDataRaw?.data ?? [];
    const merged = [...owned, ...invited];
    const seen = new Set();
    return merged.filter((m) => {
      const key = m.id ?? m._id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [meetingsDataRaw, invitedDataRaw]);

  const filtered = meetings.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    try {
      await deleteMeeting(deleteTarget?.id).unwrap();
      setDeleteTarget(null);
      toast.success(t('meetingsPage.deleteSuccess'));
    } catch (error) {
      console.error(error);
      toast.error(t('meetingsPage.deleteError'));
    }
  };

  // ✅ Loading overlay - giữ layout, không bị giật
  const isLoading = isDataLoading || isInvitedDataLoading;

  return (
    <div className="p-6 md:p-8 bg-[#12141f] overflow-y-auto h-full relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#12141f]/70 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-800 border-t-purple-400 mx-auto mb-3" />
            <p className="text-white/50 text-sm">{t('meetingsPage.loading')}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-white text-2xl font-semibold">{t('meetingsPage.title')}</h1>
          <p className="text-white/40 text-sm mt-1">
            {t('meetingsPage.totalSummary', {
              total: meetings.length,
              upcoming: meetings.filter((m) => m.status === "Scheduled").length,
            })}
          </p>
        </div>
        <button
          onClick={() => setScheduleOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white self-start sm:self-auto cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
        >
          <Plus size={16} /> {t('meetingsPage.newMeeting')}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('meetingsPage.searchPlaceholder')}
          className="w-full rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 border border-white/8 outline-none focus:border-purple-500 transition-colors"
          style={{ background: "#1e2235" }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <MeetingCard
              key={m.id ?? m._id}
              meeting={m}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
              <Video size={24} className="text-white/20" />
            </div>
            <p className="text-white/40 text-sm">
              {search ? t('meetingsPage.noResults', { q: search }) : t('meetingsPage.noMeetings')}
            </p>
          </div>
        )
      )}

      <ScheduleMeetingModal
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        hostEmail={user?.email}
        type="schedule"
      />
    </div>
  );
};

export default MeetingPage;