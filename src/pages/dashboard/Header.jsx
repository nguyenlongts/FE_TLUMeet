import { Search, Bell } from "lucide-react";
import NotificationBell from "../../components/NotificationBell";
import { useSelector } from "react-redux";
import { useGetProfileQuery } from "../../redux/features/user/userApi";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { t, i18n } = useTranslation();
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
    <div className="w-full px-8 py-6 border-b bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-4 top-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('dashboardHeader.searchPlaceholder')}
              className="w-full py-3 pl-12 pr-4 transition-colors border rounded-full bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-purple-500/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6 ml-8">
          {/* Time & Date */}
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{time}</div>
            <div className="text-xs text-slate-400">{date}</div>
          </div>

          {/* Notification */}
          <div className="relative p-2 transition-colors text-slate-400 hover:text-white">
            <NotificationBell />
            {/* <span className="absolute w-2 h-2 bg-red-500 rounded-full top-1 right-1" /> */}
          </div>

          {isLoading ? (
            <div className="w-10 h-10 rounded-full bg-slate-700/60 animate-pulse" />
          ) : avatarSrc ? (
            <img
              src={avatarSrc}
              className="w-10 h-10 rounded-full object-cover"
              alt="avatar"
            />
          ) : (
            <div className="flex items-center justify-center w-10 h-10 text-2xl font-semibold text-white rounded-full select-none bg-gradient-to-br from-violet-400 to-pink-500">
              {userData?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Header;
