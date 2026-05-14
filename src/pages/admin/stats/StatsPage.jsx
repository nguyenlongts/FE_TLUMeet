import { useState } from "react"
import { Users, Video, BarChart2, Activity, RefreshCw, ChevronRight } from "lucide-react"
import { useGetMeetingsQuery, useGetStatsQuery, useGetUsersQuery } from "../../../redux/features/admin/adminApi"
import { useSelector } from "react-redux"

/* ─── helpers ─────────────────────────────────────────────── */
const timeAgo = date => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  if (s < 60) return `${s} giây trước`
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`
  return `${Math.floor(s / 86400)} ngày trước`
}

const initials = name =>
  name.split(" ").slice(-2).map(w => w[0].toUpperCase()).join("")

const avatarPalette = [
  { bg: "bg-violet-500/20", color: "text-violet-400" },
  { bg: "bg-pink-500/20",   color: "text-pink-400"   },
  { bg: "bg-blue-500/20",   color: "text-blue-400"   },
  { bg: "bg-emerald-500/20",color: "text-emerald-400" },
  { bg: "bg-amber-500/20",  color: "text-amber-400"  },
]
const avatarColor = str => avatarPalette[str.charCodeAt(0) % avatarPalette.length]

const statusMap = {
  started: { label: "Live",        dot: "bg-green-400",  badge: "bg-green-500/15 text-green-300"  },
  created: { label: "Chờ",         dot: "bg-amber-400",  badge: "bg-amber-500/15 text-amber-300"  },
  ended:   { label: "Đã kết thúc", dot: "bg-slate-500",  badge: "bg-slate-500/15 text-slate-400"  },
  deleted: { label: "Đã xóa",      dot: "bg-red-400",    badge: "bg-red-500/15 text-red-300"      },
}


const Skeleton = ({ className = "" }) => (
  <div className={`rounded-md bg-white/5 animate-pulse ${className}`} />
)

/* ─── stat card ────────────────────────────────────────────── */
const gradients = [
  "from-violet-600 to-violet-800",
  "from-pink-600 to-pink-800",
  "from-emerald-600 to-emerald-800",
  "from-amber-500 to-amber-700",
]

const StatCard = ({ icon: Icon, label, value, sub, gradientIdx, loading }) => (
  <div className="group relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4
                  hover:border-violet-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{label}</span>
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradients[gradientIdx]} flex items-center justify-center flex-shrink-0`}>
        <Icon size={17} className="text-white" />
      </div>
    </div>

    {loading
      ? <Skeleton className="h-9 w-20" />
      : <p className="text-4xl font-bold text-white tracking-tight font-mono m-0">{value}</p>
    }

    {sub && <p className="text-xs text-slate-600 m-0">{sub}</p>}
  </div>
)


const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
      <span className="text-red-400 text-xl">!</span>
    </div>
    <p className="text-slate-400 text-sm">{message || "Đã xảy ra lỗi khi tải dữ liệu"}</p>
  </div>
)

export default function StatsPage() {
  const [tab, setTab] = useState("users")

  const {
    data: statsRaw,
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: refetchStats,
  } = useGetStatsQuery()
  const {
    data: usersRaw,
    isLoading: isUsersLoading,
    isError: isUsersError,
    refetch: refetchUsers,
  } = useGetUsersQuery()

  const {
    data: meetingsRaw,
    isLoading: isMeetingsLoading,
    isError: isMeetingsError,
    refetch: refetchMeetings,
  } = useGetMeetingsQuery()
  console.log(meetingsRaw,"mtdayroi")
  console.log(usersRaw,"usdayroi")
  const stats    = statsRaw
  const users    = usersRaw?.data ?? []
  const meetings = meetingsRaw?? []

  const isLoading  = isStatsLoading || isUsersLoading || isMeetingsLoading
  const isSpinning = isLoading

  const refetchAll = () => {
    refetchStats()
    refetchUsers()
    refetchMeetings()
  }

  const activeRate = stats && stats.totalMeetings > 0
    ? ((stats.activeMeetings / stats.totalMeetings) * 100).toFixed(1) + "%"
    : "—"

  const thCls = "px-5 py-2.5 text-left text-[10px] font-semibold tracking-widest uppercase text-slate-500 border-b border-white/[0.06] bg-white/[0.02]"
  return (
    <div className="  px-6 py-8 font-sans text-white">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[10px] font-semibold tracking-[3px] text-violet-500 mb-1.5 uppercase">TLUMeet</p>
            <h1 className="text-2xl font-bold tracking-tight m-0">Tổng quan hệ thống</h1>
          </div>
          <button
            onClick={refetchAll}
            disabled={isSpinning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04]
                       text-sm font-medium text-slate-400 hover:border-violet-500/50 transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              size={14}
              className={isSpinning ? "animate-spin" : ""}
            />
            {isSpinning ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatCard
            icon={Users} label="Tổng người dùng"
            value={stats?.totalUsers?.toLocaleString() ?? "—"}
            gradientIdx={0} loading={isStatsLoading}
          />
          <StatCard
            icon={Video} label="Tổng phòng họp"
            value={stats?.totalMeetings?.toLocaleString() ?? "—"}
            sub="tất cả thời gian"
            gradientIdx={1} loading={isStatsLoading}
          />
          <StatCard
            icon={Activity} label="Đang họp live"
            value={stats?.activeMeetings ?? "—"}
            sub="● phòng đang hoạt động"
            gradientIdx={2} loading={isStatsLoading}
          />
          <StatCard
            icon={BarChart2} label="Tỷ lệ hoạt động"
            value={isStatsLoading ? "—" : activeRate}
            sub="phòng live / tổng phòng"
            gradientIdx={3} loading={isStatsLoading}
          />
        </div>


        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">


          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
            <div className="flex gap-1">
              {[
                { key: "users",    label: "Người dùng", count: users.length    },
                { key: "meetings", label: "Phòng họp",  count: meetings.length },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150
                    ${tab === key
                      ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white transition transform ease-in-out"
                      : "bg-transparent text-slate-500 hover:bg-white/[0.06] hover:text-white"
                    }`}
                >
                  {label}
                  {!isLoading && (
                    <span className="ml-1.5 opacity-50 text-[11px]">({count})</span>
                  )}
                </button>
              ))}
            </div>
            <ChevronRight size={16} className="text-slate-600" />
          </div>


          {tab === "users" && (
            isUsersError
              ? <ErrorState message="Không thể tải danh sách người dùng" />
              : (
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className={thCls}>Người dùng</th>
                      <th className={thCls}>Email</th>
                      <th className={thCls}>Đăng ký</th>
                      <th className={thCls}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {isUsersLoading
                      ? Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}>
                          {[44, 160, 100, 80].map((w, j) => (
                            <td key={j} className="px-5 py-4">
                              <Skeleton className={`h-3.5`} style={{ width: w }} />
                            </td>
                          ))}
                        </tr>
                      ))
                      : users?.map(u => {
                        const av = avatarColor(u.userName)
                        return (
                          <tr
                            key={u.userId}
                            className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-full ${av.bg} ${av.color} flex items-center justify-center text-[11px] font-bold flex-shrink-0`}>
                                  {initials(u.userName)}
                                </div>
                                <span className="font-medium text-slate-200">{u.userName}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                            <td className="px-5 py-3.5 text-slate-500">{timeAgo(u.registeredAt)}</td>
                            {/* <td className="px-5 py-3.5">
                              <button className="border border-violet-500/40 text-violet-400 rounded-lg px-3 py-1 text-xs hover:bg-violet-500/15 transition-colors">
                                Cấp admin
                              </button>
                            </td> */}
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              )
          )}

          {tab === "meetings" && (
            isMeetingsError
              ? <ErrorState message="Không thể tải danh sách phòng họp" />
              : (
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className={thCls}>Phòng họp</th>
                      <th className={thCls}>Mã phòng</th>
                      <th className={thCls}>Số người</th>
                      <th className={thCls}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isMeetingsLoading
                      ? Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}>
                          {[180, 80, 60, 100].map((w, j) => (
                            <td key={j} className="px-5 py-4">
                              <Skeleton className="h-3.5" style={{ width: w }} />
                            </td>
                          ))}
                        </tr>
                      ))
                      : meetings.map(m => {
                        const st = statusMap[m.status] || statusMap.ended
                        return (
                          <tr
                            key={m.meetingId}
                            className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                          >
                            <td className="px-5 py-3.5 font-medium text-slate-200">{m.title}</td>
                            <td className="px-5 py-3.5">
                              <code className="bg-violet-500/15 text-violet-400 px-2.5 py-1 rounded-md text-[12px] font-mono">
                                {m.roomCode}
                              </code>
                            </td>
                            <td className="px-5 py-3.5 text-slate-500">{m.totalParticipants} người</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1.5 ${st.badge} px-3 py-1 rounded-full text-[12px] font-medium`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                {st.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              )
          )}
        </div>
      </div>
    </div>
  )
}