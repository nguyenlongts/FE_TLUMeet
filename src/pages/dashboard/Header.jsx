import { Search, Menu } from "lucide-react";
import NotificationBell from "../../components/NotificationBell";
import { useSelector } from "react-redux";
import { useGetProfileQuery } from "../../redux/features/user/userApi";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { useTranslation } from "react-i18next";
import { useSearch } from "../../context/SearchContext";

const Header = ({ onMenuClick = () => {} }) => {
  const { t, i18n } = useTranslation();
  const { search, setSearch } = useSearch();
  const data=useSelector(selectCurrentUser)
  const {data:userData,isLoading}=useGetProfileQuery(data?.id, { skip: !data?.id })
  const avatarSrc=userData?.avatarUrl ?? null;
  const now = new Date();
  const locale = i18n.language === "en" ? "en-US" : "vi-VN";
  const time = now.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const date = now.toLocaleDateString(locale, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="w-full px-4 py-4 border-b sm:px-8 sm:py-6 bg-[var(--surface)] border-[var(--line)]">
      <div className="flex items-center justify-between gap-3">
        {/* Hamburger (mobile) + Search Bar */}
        <div className="flex items-center flex-1 max-w-md gap-2">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg lg:hidden text-[var(--muted)] hover:text-[var(--content)] hover:bg-[var(--overlay)]"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-4 top-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('dashboardHeader.searchPlaceholder')}
              className="w-full py-2.5 sm:py-3 pl-12 pr-4 transition-colors border rounded-full bg-[var(--surface-2)] border-[var(--accent)]/50 text-[var(--content)] placeholder-[var(--faint)] focus:outline-none focus:border-[var(--accent-fg)]"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-6 sm:ml-8">
          {/* Time & Date — ẩn trên màn nhỏ */}
          <div className="hidden text-right md:block">
            <div className="text-2xl font-bold text-[var(--content)]">{time}</div>
            <div className="text-xs text-[var(--muted)]">{date}</div>
          </div>

          {/* Notification */}
          <div className="relative p-2 transition-colors text-[var(--muted)] hover:text-[var(--content)]">
            <NotificationBell />
            {/* <span className="absolute w-2 h-2 bg-red-500 rounded-full top-1 right-1" /> */}
          </div>

          {isLoading ? (
            <div className="w-10 h-10 rounded-full bg-[var(--overlay)] animate-pulse" />
          ) : avatarSrc ? (
            <img
              src={avatarSrc}
              className="w-10 h-10 rounded-full object-cover"
              alt="avatar"
            />
          ) : (
            <div className="flex items-center justify-center w-10 h-10 text-2xl font-semibold text-[var(--content)] rounded-full select-none bg-gradient-to-br from-[var(--accent-fg)] to-pink-500">
              {userData?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Header;
