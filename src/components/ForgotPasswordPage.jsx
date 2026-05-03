import { useState } from 'react'
import { Mail, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const STEPS = {
  EMAIL: 'email',
  OTP: 'otp',
  NEW_PASSWORD: 'new_password',
  SUCCESS: 'success',
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(STEPS.EMAIL)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const inputBase =
    'w-full py-3 pl-12 pr-4 border rounded-xl tracking-wide text-[#5a5478] placeholder-slate-500 bg-[#0f0a1e] focus:outline-none focus:border-violet-500 transition-colors'
  const inputError = 'border-red-500/60 bg-red-500/5'
  const inputNormal = 'border-[#2a2245]'

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Email không hợp lệ' })
      return
    }
    setIsLoading(true)
    try {
      // await api.sendOtp({ email })
      await new Promise((r) => setTimeout(r, 1000))
      toast.success('Mã OTP đã được gửi!')
      setStep(STEPS.OTP)
      setErrors({})
    } catch {
      toast.error('Không thể gửi OTP. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) {
      setErrors({ otp: 'Vui lòng nhập đủ 6 chữ số' })
      return
    }
    setIsLoading(true)
    try {
      // await api.verifyOtp({ email, code })
      await new Promise((r) => setTimeout(r, 1000))
      toast.success('Xác thực thành công!')
      setStep(STEPS.NEW_PASSWORD)
      setErrors({})
    } catch {
      toast.error('Mã OTP không đúng hoặc đã hết hạn.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!newPassword || newPassword.length < 6)
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự'
    if (!confirmPassword)
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
    else if (newPassword !== confirmPassword)
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }
    setIsLoading(true)
    try {
      // await api.resetPassword({ email, otp: otp.join(''), newPassword })
      await new Promise((r) => setTimeout(r, 1000))
      setStep(STEPS.SUCCESS)
      setErrors({})
    } catch {
      toast.error('Đặt lại mật khẩu thất bại. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const submitBtn = (label) => (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full py-3 font-semibold text-white transition-all duration-300 shadow-lg !bg-gradient-to-r !from-violet-600 !to-purple-500 rounded-xl hover:shadow-blue-500/50 hover:shadow-2xl cursor-pointer transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Đang xử lý...
        </span>
      ) : label}
    </button>
  )

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0b0919] py-8">
      <div className="p-8 bg-[#150f2a] border border-[#2a2245] rounded-lg w-full max-w-md mx-4">

        {/* Back button */}
        {step !== STEPS.SUCCESS && (
          <button
            onClick={() => step === STEPS.EMAIL ? navigate('/login') : setStep(STEPS.EMAIL)}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === STEPS.EMAIL ? 'Back to login page' : 'Back'}
          </button>
        )}

        {/* ── STEP 1: Email ── */}
        {step === STEPS.EMAIL && (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 mb-5">
                <KeyRound className="w-7 h-7 text-white" />
              </div>
              <h1 className="mb-2 text-4xl font-bold text-white">Forgot Password</h1>
              <p className="text-slate-400">Enter your email address and we'll send you a OTP to reset your password.</p>
            </div>
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-white">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors({}) }}
                    placeholder="Enter your email"
                    className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
              </div>
              {submitBtn('Send OTP')}
            </form>
          </>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === STEPS.OTP && (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 mb-5">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h1 className="mb-2 text-4xl font-bold text-white">Verify OTP</h1>
              <p className="text-slate-400">
                Nhập mã 6 chữ số đã gửi đến{' '}
                <span className="text-violet-400 font-medium">{email}</span>
              </p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <div className="flex gap-3 justify-between">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                      className={`w-12 h-14 text-center text-2xl font-bold border rounded-xl bg-[#0f0a1e] text-white focus:outline-none focus:border-violet-500 transition-colors ${errors.otp ? 'border-red-500/60' : 'border-[#2a2245]'}`}
                    />
                  ))}
                </div>
                {errors.otp && <p className="mt-2 text-xs text-red-400">{errors.otp}</p>}
              </div>

              <p className="text-sm text-slate-400 text-center">
                Không nhận được mã?{' '}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Gửi lại
                </button>
              </p>

              {submitBtn('Verify OTP')}
            </form>
          </>
        )}

        {/* ── STEP 3: New Password ── */}
        {step === STEPS.NEW_PASSWORD && (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 mb-5">
                <KeyRound className="w-7 h-7 text-white" />
              </div>
              <h1 className="mb-2 text-4xl font-bold text-white">New Password</h1>
              <p className="text-slate-400">Tạo mật khẩu mới cho tài khoản của bạn.</p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-white">New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: '' })) }}
                    placeholder="Enter new password"
                    className={`${inputBase} pr-12 ${errors.newPassword ? inputError : inputNormal}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword
                      ? <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
                {errors.newPassword && <p className="mt-1.5 text-xs text-red-400">{errors.newPassword}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white">Confirm Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })) }}
                    placeholder="Confirm new password"
                    className={`${inputBase} pr-12 ${errors.confirmPassword ? inputError : inputNormal}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 transition-colors">
                    {showConfirm
                      ? <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword}</p>}
              </div>

              {submitBtn('Reset Password')}
            </form>
          </>
        )}

        {/* ── STEP 4: Success ── */}
        {step === STEPS.SUCCESS && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">All Done!</h1>
            <p className="text-slate-400 mb-8">
              Mật khẩu của bạn đã được đặt lại thành công.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 font-semibold text-white transition-all duration-300 shadow-lg !bg-gradient-to-r !from-violet-600 !to-purple-500 rounded-xl hover:shadow-blue-500/50 hover:shadow-2xl cursor-pointer transform hover:scale-105"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* Footer link */}
        {/* {step !== STEPS.SUCCESS && (
          <p className="mt-6 text-center text-slate-400">
            Nhớ ra mật khẩu rồi?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
            >
              Sign In
            </button>
          </p>
        )} */}
      </div>
    </div>
  )
}