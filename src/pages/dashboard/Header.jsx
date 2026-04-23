import { Search, Bell } from "lucide-react";
import NotificationBell from "../../components/NotificationBell";

const Header = () => {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const date = now.toLocaleDateString("en-US", {
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
              placeholder="Search here"
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
          <button className="relative p-2 transition-colors text-slate-400 hover:text-white">
            <NotificationBell />
            <span className="absolute w-2 h-2 bg-red-500 rounded-full top-1 right-1" />
          </button>

          {/* User Avatar */}
          <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-white transition-shadow rounded-full cursor-pointer bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 hover:shadow-lg hover:shadow-purple-500/50">
            J
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
