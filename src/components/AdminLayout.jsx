import { useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import authApi, { useLogoutUserMutation } from '../redux/features/auth/authApi'
// import { selectAccessToken } from '../../redux/features/auth/authSlice'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Video,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Shield,
  TrendingUp,
  UserCheck,
  Menu,
  X,
} from 'lucide-react'

export default function AdminLayout() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const dispatch   = useDispatch()
  const { t, i18n } = useTranslation()
  const [logoutUser] = useLogoutUserMutation()
  const [collapsed,    setCollapsed]    = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [searchQuery,  setSearchQuery]  = useState('')

  const NAV_ITEMS = [
    {
      section: t('admin.nav.overview'),
      items: [
        { icon: LayoutDashboard, label: t('admin.nav.dashboard'), path: '/admin' },
      ],
    },
    {
      section: t('admin.nav.management'),
      items: [
        { icon: Users, label: t('admin.nav.users'), path: '/admin/users' },
        { icon: Video, label: t('admin.nav.meetings'), path: '/admin/meetings' },
      ],
    },
    {
      section: t('admin.nav.system'),
      items: [
        { icon: Settings, label: t('admin.nav.settings'), path: '/admin/settings' },
      ],
    },
  ]

  const isActive = (path) =>
    path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(path)

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap()
    } catch {
      // server lỗi thì vẫn clear ở client
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch(authApi.util.resetApiState())
    navigate('/login')
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#0b0919', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed md:relative z-50 md:z-auto flex flex-col h-full
          border-r border-[#2a2245] transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-[240px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ background: '#150f2a' }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 py-5 border-b border-[#2a2245] shrink-0"
          style={{ minHeight: 72 }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
          >
            <Shield size={18} color="white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-semibold text-sm leading-tight whitespace-nowrap">TLUHub</p>
              <p className="text-[11px] leading-tight whitespace-nowrap" style={{ color: '#8b7bb5' }}>
                {t('admin.nav.panelName')}
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex ml-auto w-6 h-6 rounded-lg items-center justify-center transition-colors hover:bg-white/10 shrink-0"
            style={{ color: '#8b7bb5' }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {NAV_ITEMS.map((group) => (
            <div key={group.section}>
              {!collapsed && (
                <p
                  className="px-3 mb-1.5 text-[10px] uppercase tracking-widest font-medium"
                  style={{ color: '#5a4d7a' }}
                >
                  {group.section}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map(({ icon: Icon, label, path }) => {
                  const active = isActive(path)
                  return (
                    <button
                      key={path}
                      onClick={() => { navigate(path); setMobileOpen(false) }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                        transition-all duration-150 group relative
                        ${active
                          ? 'text-white'
                          : 'hover:bg-white/5'
                        }
                      `}
                      style={active ? { background: 'rgba(168,85,247,0.15)' } : {}}
                      title={collapsed ? label : undefined}
                    >
                      {active && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                          style={{ background: 'linear-gradient(180deg, #a855f7, #7c3aed)' }}
                        />
                      )}
                      <Icon
                        size={17}
                        style={{ color: active ? '#a855f7' : '#8b7bb5', flexShrink: 0 }}
                        className="group-hover:text-violet-400 transition-colors"
                      />
                      {!collapsed && (
                        <span
                          className="whitespace-nowrap font-medium"
                          style={{ color: active ? '#ffffff' : '#8b7bb5' }}
                        >
                          {label}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
        
        <div className="shrink-0 border-t border-[#2a2245] p-3 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-red-500/10 group"
          >
            <LogOut size={17} style={{ color: '#8b7bb5', flexShrink: 0 }}
              className="group-hover:text-red-400 transition-colors" />
            {!collapsed && (
              <span className="text-sm font-medium group-hover:text-red-400 transition-colors"
                style={{ color: '#8b7bb5' }}>
                {t('admin.nav.logout')}
              </span>
            )}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">

        <header
          className="shrink-0 flex items-center gap-4 px-5 border-b border-[#2a2245]"
          style={{ background: '#150f2a', height: 72 }}
        >
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
            style={{ color: '#8b7bb5' }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="hidden md:block">
            <h1 className="text-white text-base font-semibold leading-tight">
              {NAV_ITEMS.flatMap(g => g.items).find(i => isActive(i.path))?.label ?? t('admin.nav.admin')}
            </h1>
            <p className="text-[11px]" style={{ color: '#5a4d7a' }}>
              {new Date().toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div
            className="flex items-center gap-2 flex-1 max-w-sm mx-auto md:mx-0 md:ml-6 px-3.5 py-2 rounded-xl border border-[#2a2245] transition-colors focus-within:border-violet-500/50"
            style={{ background: '#0f0a1e' }}
          >
            <Search size={15} style={{ color: '#5a4d7a', flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('admin.nav.searchPlaceholder')}
              className="flex-1 bg-transparent text-sm text-white placeholder-[#5a4d7a] outline-none"
            />
            <kbd
              className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded-md border border-[#2a2245]"
              style={{ color: '#5a4d7a' }}
            >
              ⌘K
            </kbd>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Language switcher */}
            <div className="flex items-center rounded-xl border border-[#2a2245] overflow-hidden" style={{ background: '#0f0a1e' }}>
              {['vi', 'en'].map(lng => (
                <button
                  key={lng}
                  onClick={() => i18n.changeLanguage(lng)}
                  className={`px-2.5 py-1.5 text-[11px] font-semibold uppercase transition-colors ${
                    i18n.language === lng
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}>
                  {lng}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-6 mx-1" style={{ background: '#2a2245' }} />

            {/* Avatar */}
            <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
              >
                A
              </div>
              <div className="hidden md:block text-left">
                <p className="text-white text-xs font-medium leading-tight">{t('admin.nav.admin')}</p>
                <p className="text-[10px] leading-tight" style={{ color: '#8b7bb5' }}>
                  admin@tluhub.vn
                </p>
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6" style={{ background: '#0b0919' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}