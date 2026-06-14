import { useEffect, useState } from 'react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useLoginUserMutation } from '../redux/features/auth/authApi'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { selectAccessToken, setCredentials } from '../redux/features/auth/authSlice'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const LoginForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const from = location.state?.from?.pathname ?? '/dashboard'

  const { t, i18n } = useTranslation()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginUser, { isLoading }] = useLoginUserMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await loginUser({ email, password }).unwrap()

      // Decode JWT để lấy roles (backend trả về mảng `roles`, vd ["super_admin"])
      const payload = JSON.parse(atob(res.data.token.split('.')[1]))
      const roles = (payload.roles ?? [payload.role ?? payload.Role])
        .filter(Boolean)
        .map((r) => r.toString().trim().toLowerCase())
      const isAdmin = roles.some((r) => r.includes('admin'))

      dispatch(
        setCredentials({
          user: {
            id: res.data.id,
            email: res.data.email,
            name: res.data.name,
            roles,
          },
          accessToken: res.data.token,
          refreshToken: res.data.refreshToken,
        })
      )

      toast.success(res.message)
      navigate(isAdmin ? '/admin' : from, { replace: true })
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.message ||
        t('login.toast.loginError')
      toast.error(message, { position: 'top-center' })
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-[var(--bg)]">
      <div className="p-8 bg-[var(--surface)] border border-[var(--line)] rounded-lg w-lg">

        {/* Language switcher */}
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={() => i18n.changeLanguage('vi')}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              i18n.language === 'vi'
                ? 'bg-[var(--accent)] text-[var(--content)]'
                : 'text-[var(--muted)] hover:text-[var(--content)]'
            }`}
          >
            VI
          </button>
          <button
            onClick={() => i18n.changeLanguage('en')}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              i18n.language === 'en'
                ? 'bg-[var(--accent)] text-[var(--content)]'
                : 'text-[var(--muted)] hover:text-[var(--content)]'
            }`}
          >
            EN
          </button>
        </div>

        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-[var(--content)]">{t('login.welcome')}</h1>
          <p className="text-[var(--muted)]">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-[var(--content)]">
              {t('login.emailLabel')}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-[var(--faint)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                className="w-full py-3 pl-12 pr-4 outline-none focus:border-[var(--accent)] border rounded-xl tracking-widest text-[var(--faint)] placeholder-slate-500"
              />
            </div>
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-[var(--content)]">
              {t('login.passwordLabel')}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-[var(--faint)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.passwordPlaceholder')}
                autoComplete="current-password"
                className="w-full py-3 pl-12 pr-4 focus:border-[var(--accent)] outline-none border tracking-widest text-[var(--faint)] rounded-xl placeholder-slate-500 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-[var(--faint)] hover:text-[var(--muted)] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 border rounded cursor-pointer border-[var(--line)] accent-[var(--accent)]"
              />
              <span className="text-[var(--muted)]">{t('login.rememberMe')}</span>
            </label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-blue-400 transition-colors hover:text-blue-300 cursor-pointer"
            >
              {t('login.forgotPassword')}
            </button>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 font-semibold text-[var(--content)] transition-all duration-300 shadow-lg !bg-gradient-to-r !from-[var(--accent)] !to-[var(--accent)] 
              rounded-xl hover:shadow-blue-500/50 hover:shadow-2xl cursor-pointer 
              transform hover:scale-105
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? t('login.signingIn') : t('login.signIn')}
          </button>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--line)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-[var(--muted)] bg-[var(--surface)]">
                {t('login.orContinueWith')}
              </span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="py-3 font-medium text-[var(--content)] transition-all border bg-[var(--surface)] border-[var(--line)] hover:bg-[var(--accent)]/10 rounded-xl hover:border-[var(--accent)]/50"
            >
              Google
            </button>
            <button
              type="button"
              className="py-3 font-medium text-[var(--content)] transition-all border bg-[var(--surface)] border-[var(--line)] hover:bg-[var(--accent)]/10 rounded-xl hover:border-[var(--accent)]/50"
            >
              Facebook
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-[var(--muted)]">
          {t('login.noAccount')}{' '}
          <button
            onClick={() => navigate('/register')}
            className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
          >
            {t('login.signUp')}
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginForm