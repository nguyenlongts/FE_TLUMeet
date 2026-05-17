import { useState } from 'react'
import { Mail, ArrowLeft, KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useForgotPasswordMutation } from '../redux/features/auth/authApi'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ')
      return
    }

    try {
      await forgotPassword({ email }).unwrap()
      setSuccess(true)
    } catch (err) {
      setError(err?.data?.message || 'Không thể gửi email. Vui lòng thử lại.')
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0919]">
        <div className="p-8 bg-[#150f2a] border border-[#2a2245] rounded-lg w-full max-w-md mx-4 text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Email đã được gửi!</h1>
          <p className="text-slate-400 mb-8">
            Kiểm tra hộp thư của <span className="text-violet-400 font-medium">{email}</span> và nhấn vào liên kết để đặt lại mật khẩu.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 font-semibold text-white transition-all duration-300 shadow-lg !bg-gradient-to-r !from-violet-600 !to-purple-500 rounded-xl hover:shadow-blue-500/50 hover:shadow-2xl cursor-pointer transform hover:scale-105"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0b0919]">
      <div className="p-8 bg-[#150f2a] border border-[#2a2245] rounded-lg w-full max-w-md mx-4">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login page
        </button>

        <div className="mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 mb-5">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="mb-2 text-4xl font-bold text-white">Forgot Password</h1>
          <p className="text-slate-400">Enter your email and we'll send you a reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-white">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="Enter your email"
                className={`w-full py-3 pl-12 pr-4 border rounded-xl tracking-wide text-[#5a5478] placeholder-slate-500 bg-[#0f0a1e] focus:outline-none focus:border-violet-500 transition-colors ${error ? 'border-red-500/60 bg-red-500/5' : 'border-[#2a2245]'}`}
              />
            </div>
            {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
          </div>

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
                Đang gửi...
              </span>
            ) : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  )
}
