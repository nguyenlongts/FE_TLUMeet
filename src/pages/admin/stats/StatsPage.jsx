import { useState, useMemo } from "react"
import { Users, Video, BarChart2, Activity, RefreshCw, ChevronRight, User } from "lucide-react"
import { useGetMeetingsQuery, useGetStatsQuery, useGetUsersQuery } from "../../../redux/features/admin/adminApi"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts"

/* ─── helpers ─────────────────────────────────────────────── */
const useTimeAgo = () => {
  const { t } = useTranslation()
  return date => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000)
    if (s < 60) return t('admin.stats.timeAgo.seconds', { count: s })
    if (s < 3600) return t('admin.stats.timeAgo.minutes', { count: Math.floor(s / 60) })
    if (s < 86400) return t('admin.stats.timeAgo.hours', { count: Math.floor(s / 3600) })
    return t('admin.stats.timeAgo.days', { count: Math.floor(s / 86400) })
  }
}

const statusStyleMap = {
  started: { dot: "bg-green-400",  badge: "bg-green-500/15 text-green-300"  },
  created: { dot: "bg-amber-400",  badge: "bg-amber-500/15 text-amber-300"  },
  ended:   { dot: "bg-slate-500",  badge: "bg-slate-500/15 text-slate-400"  },
  deleted: { dot: "bg-red-400",    badge: "bg-red-500/15 text-red-300"      },
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


const ErrorState = ({ message }) => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
        <span className="text-red-400 text-xl">!</span>
      </div>
      <p className="text-slate-400 text-sm">{message || t('admin.stats.errorGeneric')}</p>
    </div>
  )
}

/* ─── charts ───────────────────────────────────────────────── */
const STATUS_META = [
  { key: "live",      label: "Live",      color: "#34d399" },
  { key: "scheduled", label: "Scheduled", color: "#22d3ee" },
  { key: "waiting",   label: "Waiting",   color: "#f59e0b" },
  { key: "ended",     label: "Ended",     color: "#64748b" },
]
const normStatus = (s) =>
  typeof s === "number"
    ? ({ 0: "scheduled", 1: "waiting", 2: "live", 3: "ended" }[s] ?? "other")
    : (s || "").toString().toLowerCase()

const DashboardCharts = ({ meetings, t }) => {
  const { daily, statusData } = useMemo(() => {
    const days = []
    const today = new Date(); today.setHours(0, 0, 0, 0)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      days.push({ key: d.toDateString(), name: d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" }), value: 0 })
    }
    const map = Object.fromEntries(days.map((d) => [d.key, d]))
    const counts = {}
    meetings.forEach((m) => {
      counts[normStatus(m.status)] = (counts[normStatus(m.status)] || 0) + 1
      if (m.createdAt) {
        const d = new Date(m.createdAt); d.setHours(0, 0, 0, 0)
        const hit = map[d.toDateString()]; if (hit) hit.value++
      }
    })
    const statusData = STATUS_META
      .map((m) => ({ name: m.label, value: counts[m.key] || 0, color: m.color }))
      .filter((x) => x.value > 0)
    return { daily: days.map(({ name, value }) => ({ name, value })), statusData }
  }, [meetings])

  const tooltipStyle = { background: "#150f2a", border: "1px solid #2a2245", borderRadius: 12, color: "#fff", fontSize: 12 }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-7">
      {/* Bar: meetings per day */}
      <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-0.5">{t('admin.stats.charts.perDayTitle', 'Phòng họp 7 ngày qua')}</h3>
        <p className="text-xs text-slate-500 mb-4">{t('admin.stats.charts.perDaySub', 'Số phòng được tạo theo ngày')}</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={daily} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "rgba(124,58,237,0.08)" }} contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#7c3aed" maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie: status breakdown */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 flex flex-col">
        <h3 className="text-sm font-semibold text-white mb-0.5">{t('admin.stats.charts.statusTitle', 'Trạng thái phòng họp')}</h3>
        <p className="text-xs text-slate-500 mb-2">{t('admin.stats.charts.statusSub', 'Phân bổ theo trạng thái')}</p>
        {statusData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} stroke="none">
                {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center flex-1 py-10 text-sm text-slate-500">
            {t('admin.stats.charts.noData', 'Chưa có dữ liệu')}
          </div>
        )}
      </div>
    </div>
  )
}

export default function StatsPage() {
  const { t } = useTranslation()
  const timeAgo = useTimeAgo()
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
            <p className="text-[10px] font-semibold tracking-[3px] text-violet-500 mb-1.5 uppercase">{t('admin.stats.tag')}</p>
            <h1 className="text-2xl font-bold tracking-tight m-0">{t('admin.stats.title')}</h1>
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
            {isSpinning ? t('admin.stats.loading') : t('admin.stats.refresh')}
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatCard
            icon={Users} label={t('admin.stats.cards.totalUsers')}
            value={stats?.totalUsers?.toLocaleString() ?? "—"}
            gradientIdx={0} loading={isStatsLoading}
          />
          <StatCard
            icon={Video} label={t('admin.stats.cards.totalMeetings')}
            value={stats?.totalMeetings?.toLocaleString() ?? "—"}
            sub={t('admin.stats.cards.totalMeetingsSub')}
            gradientIdx={1} loading={isStatsLoading}
          />
          <StatCard
            icon={Activity} label={t('admin.stats.cards.liveMeetings')}
            value={stats?.activeMeetings ?? "—"}
            sub={t('admin.stats.cards.liveMeetingsSub')}
            gradientIdx={2} loading={isStatsLoading}
          />
          <StatCard
            icon={BarChart2} label={t('admin.stats.cards.activeRate')}
            value={isStatsLoading ? "—" : activeRate}
            sub={t('admin.stats.cards.activeRateSub')}
            gradientIdx={3} loading={isStatsLoading}
          />
        </div>

        {/* Charts */}
        <DashboardCharts meetings={meetings} t={t} />

        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">


          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
            <div className="flex gap-1">
              {[
                { key: "users",    label: t('admin.stats.tabs.users'),    count: users.length    },
                { key: "meetings", label: t('admin.stats.tabs.meetings'), count: meetings.length },
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
              ? <ErrorState message={t('admin.stats.usersTable.errorLoad')} />
              : (
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className={thCls}>{t('admin.stats.usersTable.user')}</th>
                      <th className={thCls}>{t('admin.stats.usersTable.email')}</th>
                      <th className={thCls}>{t('admin.stats.usersTable.registered')}</th>
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
                        return (
                          <tr
                            key={u.userId}
                            className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                {u.avatarUrl ? (
                                  <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                    <User size={14} className="text-slate-500" />
                                  </div>
                                )}
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
              ? <ErrorState message={t('admin.stats.meetingsTable.errorLoad')} />
              : (
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className={thCls}>{t('admin.stats.meetingsTable.meeting')}</th>
                      <th className={thCls}>{t('admin.stats.meetingsTable.roomCode')}</th>
                      <th className={thCls}>{t('admin.stats.meetingsTable.participants')}</th>
                      <th className={thCls}>{t('admin.stats.meetingsTable.status')}</th>
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
                        const st = statusStyleMap[m.status] || statusStyleMap.ended
                        const statusLabel = t(`admin.stats.meetingStatus.${m.status}`, { defaultValue: m.status })
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
                            <td className="px-5 py-3.5 text-slate-500">
                              {t('admin.stats.meetingsTable.participantsCount', { count: m.totalParticipants })}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1.5 ${st.badge} px-3 py-1 rounded-full text-[12px] font-medium`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                {statusLabel}
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