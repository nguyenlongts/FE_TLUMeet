import { Home, Calendar, Video, Settings, LogOut, User } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import authApi, { useLogoutUserMutation } from '../../redux/features/auth/authApi'

const NavItem = ({ icon: Icon, label, active, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-sm font-medium group ${
        active
          ? 'bg-[var(--accent)] text-white transform transition scale-105 duration-200'
          : `text-[var(--muted)] hover:bg-[var(--overlay)] ${className}`
      }`}
    >
      <Icon className="flex-shrink-0 w-5 h-5" />
      <span>{label}</span>
      {active && <div className="w-1 h-8 ml-auto bg-[var(--accent-fg)] rounded-full" />}
    </button>
  )
}

const Sidebar = () => {
  const { t } = useTranslation()
  const [activeView, setActiveView] = useState('home')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [logoutUser] = useLogoutUserMutation()

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
    <div className="flex flex-col items-center w-56 h-screen gap-12 py-8 border-r bg-[var(--surface)] border-[var(--line)]">
      <img
        src="/iconlogo-clear.png"
        alt="TLU Meeting"
        onClick={() => navigate('/dashboard')}
        className="object-contain w-20 h-20 transition-transform cursor-pointer hover:scale-105"
      />

      <nav className="flex flex-col items-start w-full gap-8 px-4">
        <NavItem
          icon={Home}
          label={t('sidebar.home')}
          active={activeView === 'home'}
          onClick={() => { navigate('/dashboard'); setActiveView('home') }}
        />
        <NavItem
          icon={Calendar}
          label={t('sidebar.calendar')}
          active={activeView === 'calendar'}
          onClick={() => { navigate('calendar'); setActiveView('calendar') }}
        />
        <NavItem
          icon={Video}
          label={t('sidebar.meeting')}
          active={activeView === 'meetings'}
          onClick={() => { navigate('meetings'); setActiveView('meetings') }}
        />
        <NavItem
          icon={User}
          label={t('sidebar.profile')}
          active={activeView === 'profile'}
          onClick={() => { navigate('profile'); setActiveView('profile') }}
        />
        <NavItem
          icon={Settings}
          label={t('sidebar.settings')}
          active={activeView === 'settings'}
          onClick={() => { navigate('settings'); setActiveView('settings') }}
        />
      </nav>

      <div className="flex items-center justify-start gap-2 px-4 py-2 mt-auto transition transform border border-[var(--line)] cursor-pointer rounded-xl hover:bg-[var(--overlay)] hover:scale-105">
        <button
          onClick={handleLogout}
          className="cursor-pointer flex items-center justify-center gap-2 text-[var(--muted)]"
        >
          <LogOut className="text-[var(--content)]" />
          {t('sidebar.logout')}
        </button>
      </div>
    </div>
  )
}

export default Sidebar