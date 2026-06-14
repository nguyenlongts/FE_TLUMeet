import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { KeyRound, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import authApi, { useChangePasswordMutation, useLogoutUserMutation } from '../../redux/features/auth/authApi'

const inputBase =
  'w-full py-3 pl-12 pr-12 border rounded-xl tracking-wide text-[var(--accent-fg)] placeholder-slate-500 bg-[var(--bg)] focus:outline-none focus:border-[var(--accent)] transition-colors'

const Field = ({ label, name, value, onChange, showPassword, onToggleShow, placeholder, error }) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-[var(--content)]">{label}</label>
    <div className="relative">
      <KeyRound className="absolute left-4 top-3.5 w-5 h-5 text-[var(--faint)]" />
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="new-password"
        className={`${inputBase} ${error ? 'border-red-500/60' : 'border-[var(--line)]'} [&::-ms-reveal]:hidden [&::-ms-clear]:hidden`}
      />
      <button type="button" onClick={onToggleShow}
        className="absolute right-4 top-3.5 text-[var(--faint)] hover:text-[var(--muted)] transition-colors">
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
    {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
  </div>
)

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [errors, setErrors] = useState({})

  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const [logoutUser] = useLogoutUserMutation()

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setErrors((p) => ({ ...p, [e.target.name]: '', api: '' }))
  }

  const validate = () => {
    const e_ = {}
    if (!form.currentPassword) e_.currentPassword = t('changePassword.currentRequired')
    if (!form.newPassword) e_.newPassword = t('changePassword.newRequired')
    else if (form.newPassword.length < 6) e_.newPassword = t('changePassword.newMin')
    else if (form.newPassword === form.currentPassword) e_.newPassword = t('changePassword.newSameAsOld')
    if (form.confirmPassword !== form.newPassword) e_.confirmPassword = t('changePassword.confirmMismatch')
    setErrors(e_)
    return !Object.keys(e_).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }).unwrap()

      toast.success(t('changePassword.successMessage'))
      try { await logoutUser().unwrap() } catch { /* clear vẫn xảy ra */ }
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      dispatch(authApi.util.resetApiState())
      navigate('/login')
    } catch (err) {
      const msg = err?.data?.message || t('changePassword.error')
      setErrors({ api: msg })
      toast.error(msg)
    }
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg)] py-8">
      <div className="p-8 bg-[var(--surface)] border border-[var(--line)] rounded-lg w-full max-w-md mx-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--content)] transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('changePassword.back')}
        </button>

        <div className="mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent)] mb-5">
            <KeyRound className="w-7 h-7 text-[var(--content)]" />
          </div>
          <h1 className="mb-2 text-4xl font-bold text-[var(--content)]">{t('changePassword.title')}</h1>
          <p className="text-[var(--muted)]">{t('changePassword.subtitle')}</p>
        </div>

        {errors.api && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/40 text-red-300 p-3 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{errors.api}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field
            label={t('changePassword.currentLabel')}
            name="currentPassword"
            value={form.currentPassword}
            onChange={onChange}
            showPassword={show.current}
            onToggleShow={() => setShow((s) => ({ ...s, current: !s.current }))}
            placeholder={t('changePassword.currentPlaceholder')}
            error={errors.currentPassword}
          />
          <Field
            label={t('changePassword.newLabel')}
            name="newPassword"
            value={form.newPassword}
            onChange={onChange}
            showPassword={show.new}
            onToggleShow={() => setShow((s) => ({ ...s, new: !s.new }))}
            placeholder={t('changePassword.newPlaceholder')}
            error={errors.newPassword}
          />
          <Field
            label={t('changePassword.confirmLabel')}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={onChange}
            showPassword={show.confirm}
            onToggleShow={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
            placeholder={t('changePassword.confirmPlaceholder')}
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 font-semibold text-[var(--content)] shadow-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent)] rounded-xl hover:shadow-blue-500/50 hover:shadow-2xl cursor-pointer transform hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? t('changePassword.submitting') : t('changePassword.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
