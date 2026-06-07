import { useState } from 'react'
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useForgotPasswordMutation } from '../redux/features/auth/authApi'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [sentTo, setSentTo] = useState(null)
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: t('forgotPassword.emailInvalid') })
      return
    }
    try {
      await forgotPassword(email).unwrap()
      setSentTo(email)
    } catch (err) {
      toast.error(err?.data?.message || t('forgotPassword.error'))
    }
  }

  const inputBase =
    'w-full py-3 pl-12 pr-4 border rounded-xl tracking-wide text-[#c4b5fd] placeholder-slate-500 bg-[#0f0a1e] focus:outline-none focus:border-violet-500 transition-colors'

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0b0919] py-8">
      <div className="p-8 bg-[#150f2a] border border-[#2a2245] rounded-lg w-full max-w-md mx-4">
        {!sentTo ? (
          <>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('forgotPassword.back')}
            </button>

            <div className="mb-8">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 mb-5">
                <KeyRound className="w-7 h-7 text-white" />
              </div>
              <h1 className="mb-2 text-4xl font-bold text-white">{t('forgotPassword.title')}</h1>
              <p className="text-slate-400">{t('forgotPassword.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-white">{t('forgotPassword.emailLabel')}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors({}) }}
                    placeholder={t('forgotPassword.emailPlaceholder')}
                    className={`${inputBase} ${errors.email ? 'border-red-500/60' : 'border-[#2a2245]'}`}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 font-semibold text-white shadow-lg bg-gradient-to-r from-violet-600 to-purple-500 rounded-xl hover:shadow-blue-500/50 hover:shadow-2xl cursor-pointer transform hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">{t('forgotPassword.successTitle')}</h1>
            <p className="text-slate-400 mb-8 leading-relaxed">
              {t('forgotPassword.successDesc', { email: sentTo })}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 font-semibold text-white shadow-lg bg-gradient-to-r from-violet-600 to-purple-500 rounded-xl hover:shadow-blue-500/50 hover:shadow-2xl cursor-pointer transform hover:scale-105 transition-all"
            >
              {t('forgotPassword.backToLogin')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
