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
  const [activeTab, setActiveTab] = useState("all"); // all | owned | invited
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  // ✅ useMemo không bị lỗi vì dùng optional chaining
  const meetings = useMemo(() => {
    const owned = (meetingsDataRaw?.data ?? []).map((m) => ({ ...m, _source: "owned" }));
    const invited = (invitedDataRaw?.data ?? []).map((m) => ({ ...m, _source: "invited" }));
    const merged = [...owned, ...invited]; // owned đứng trước → ưu tiên giữ khi trùng
    const seen = new Set();
    return merged.filter((m) => {
      const key = m.id ?? m._id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [meetingsDataRaw, invitedDataRaw]);

  const ownedCount = meetings.filter((m) => m._source === "owned").length;
  const invitedCount = meetings.filter((m) => m._source === "invited").length;

  const tabs = [
    { key: "all", label: t("meetingsPage.tabAll"), count: meetings.length },
    { key: "owned", label: t("meetingsPage.tabOwned"), count: ownedCount },
    { key: "invited", label: t("meetingsPage.tabInvited"), count: invitedCount },
  ];

  const filtered = meetings.filter((m) => {
    const matchTab = activeTab === "all" || m._source === activeTab;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

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
    <div className="p-6 md:p-8 bg-[var(--bg)] overflow-y-auto h-full relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--bg)]/70 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent-hover)] border-t-[var(--accent-fg)] mx-auto mb-3" />
            <p className="text-[var(--content)]/50 text-sm">{t('meetingsPage.loading')}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[var(--content)] text-2xl font-semibold">{t('meetingsPage.title')}</h1>
          <p className="text-[var(--content)]/40 text-sm mt-1">
            {t('meetingsPage.totalSummary', {
              total: meetings.length,
              upcoming: meetings.filter((m) => m.status === "Scheduled").length,
            })}
          </p>
        </div>
        <button
          onClick={() => setScheduleOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--content)] self-start sm:self-auto cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
        >
          <Plus size={16} /> {t('meetingsPage.newMeeting')}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--content)]/30"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('meetingsPage.searchPlaceholder')}
          className="w-full rounded-xl pl-11 pr-4 py-3 text-sm text-[var(--content)] placeholder-white/30 border border-[var(--line)] outline-none focus:border-[var(--accent)] transition-colors"
          style={{ background: "var(--surface)" }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--content)]/30 hover:text-[var(--content)]/60 transition-colors text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "text-[var(--content)]"
                : "text-[var(--content)]/50 hover:text-[var(--content)]/80 border border-[var(--line)]"
            }`}
            style={
              activeTab === tab.key
                ? { background: "linear-gradient(135deg, #a855f7, #7c3aed)" }
                : { background: "var(--surface)" }
            }
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">{tab.count}</span>
          </button>
        ))}
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
            <div className="w-14 h-14 rounded-2xl bg-[var(--overlay)] flex items-center justify-center">
              <Video size={24} className="text-[var(--content)]/20" />
            </div>
            <p className="text-[var(--content)]/40 text-sm">
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