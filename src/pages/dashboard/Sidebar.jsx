import { Home, Calendar, Video, Settings, LogOut, CirclePlus, User } from 'lucide-react'
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
          ? 'bg-orange-500 text-white transform transition scale-105 duration-200'
          : `text-slate-300 hover:bg-slate-800 ${className}`
      }`}
    >
      <Icon className="flex-shrink-0 w-5 h-5" />
      <span>{label}</span>
      {active && <div className="w-1 h-8 ml-auto bg-orange-300 rounded-full" />}
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
    <div className="flex flex-col items-center w-56 h-screen gap-12 py-8 border-r bg-linear-to-b from-slate-900 to-slate-950 border-slate-800">
      <div className="flex items-center justify-center w-20 h-20 transition-shadow rounded-full cursor-pointer bg-gradient-to-br from-orange-400 to-red-500 hover:shadow-lg hover:shadow-orange-500/50">
        <CirclePlus />
      </div>

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

      <div className="flex items-center justify-start gap-2 px-4 py-2 mt-auto transition transform border cursor-pointer rounded-xl hover:bg-slate-800 hover:scale-105">
        <button
          onClick={handleLogout}
          className="cursor-pointer flex items-center justify-center gap-2 text-slate-300"
        >
          <LogOut className="text-white" />
          {t('sidebar.logout')}
        </button>
      </div>
    </div>
  )
}

export default Sidebar