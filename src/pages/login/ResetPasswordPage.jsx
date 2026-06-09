import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { KeyRound, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useResetPasswordMutation } from '../../redux/features/auth/authApi'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)

  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  const submit = async (e) => {
    e.preventDefault()
    const e_ = {}
    if (!token) e_.token = t('resetPassword.tokenInvalid')
    if (password.length < 6) e_.password = t('resetPassword.passwordMin')
    if (password !== confirm) e_.confirm = t('resetPassword.passwordMismatch')
    if (Object.keys(e_).length) {
      setErrors(e_)
      return
    }
    try {
      await resetPassword({ token, newPassword: password }).unwrap()
      setDone(true)
    } catch (err) {
      toast.error(err?.data?.message || t('resetPassword.error'))
    }
  }

  const inputBase =
    'w-full py-3 pl-12 pr-12 border rounded-xl tracking-wide text-[var(--accent-fg)] placeholder-slate-500 bg-[var(--bg)] focus:outline-none focus:border-[var(--accent)] transition-colors'

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg)] py-8">
      <div className="p-8 bg-[var(--surface)] border border-[var(--line)] rounded-lg w-full max-w-md mx-4">
        {!done ? (
          <>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--content)] transition-colors text-sm mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('resetPassword.backToLogin')}
            </button>

            <div className="mb-8">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent)] mb-5">
                <KeyRound className="w-7 h-7 text-[var(--content)]" />
              </div>
              <h1 className="mb-2 text-4xl font-bold text-[var(--content)]">{t('resetPassword.title')}</h1>
              <p className="text-[var(--muted)]">{t('resetPassword.subtitle')}</p>
            </div>

            {!token && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/40 text-red-300 p-3 rounded-lg mb-4">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm">{t('resetPassword.tokenInvalid')}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-[var(--content)]">{t('resetPassword.newPasswordLabel')}</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3.5 w-5 h-5 text-[var(--faint)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
                    placeholder={t('resetPassword.newPasswordPlaceholder')}
                    className={`${inputBase} ${errors.password ? 'border-red-500/60' : 'border-[var(--line)]'}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-[var(--faint)] hover:text-[var(--muted)] transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-[var(--content)]">{t('resetPassword.confirmPasswordLabel')}</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3.5 w-5 h-5 text-[var(--faint)]" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: '' })) }}
                    placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                    className={`${inputBase} ${errors.confirm ? 'border-red-500/60' : 'border-[var(--line)]'}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-3.5 text-[var(--faint)] hover:text-[var(--muted)] transition-colors">
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirm && <p className="mt-1.5 text-xs text-red-400">{errors.confirm}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full py-3 font-semibold text-[var(--content)] shadow-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent)] rounded-xl hover:shadow-blue-500/50 hover:shadow-2xl cursor-pointer transform hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? t('resetPassword.submitting') : t('resetPassword.submit')}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-[var(--content)]" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--content)] mb-3">{t('resetPassword.successTitle')}</h1>
            <p className="text-[var(--muted)] mb-8">{t('resetPassword.successDesc')}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 font-semibold text-[var(--content)] shadow-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent)] rounded-xl hover:shadow-blue-500/50 hover:shadow-2xl cursor-pointer transform hover:scale-105 transition-all"
            >
              {t('resetPassword.backToLogin')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
