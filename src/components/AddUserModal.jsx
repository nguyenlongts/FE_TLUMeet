import { useState } from 'react'
import { Plus, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import ModalShell from './ModalShell'
const genPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
const fieldCls = (err) =>
  `w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border transition-colors
   bg-[#0f0a1e] placeholder-[#5a4d7a]
   ${err ? 'border-red-500/50 focus:border-red-400' : 'border-[#2a2245] focus:border-violet-500/60'}`

function ModalActions({ onClose, onSubmit, loading, submitLabel }) {
  return (
    <div className="flex gap-3 mt-6">
      <button onClick={onClose}
        className="flex-1 py-2.5 rounded-xl text-sm border border-[#2a2245] hover:bg-white/5 transition-colors"
        style={{ color: '#8b7bb5' }}>
        Hủy
      </button>
      <button onClick={onSubmit} disabled={loading}
        className="flex-[2] py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>
        {loading ? <RefreshCw size={14} className="animate-spin" /> : null}
        {submitLabel}
      </button>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b7bb5' }}>{label}</label>
      {children}
      {error && <p className="text-[11px] mt-1 text-red-400">{error}</p>}
    </div>
  )
}

const AddUserModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ name: '', email: '', role: 'User' })
  const [password]      = useState(genPassword)
  const [showPw, setShowPw]   = useState(false)
  const [copied, setCopied]   = useState(false)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.name.trim())                         e.name  = 'Họ tên không được để trống'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ'
    setErrors(e)
    return !Object.keys(e).length
  }

  const copyPw = () => {
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      // await api.createUser({ ...form, password })
      await new Promise(r => setTimeout(r, 800))
      onAdd({ id: Date.now(), ...form, status: 'active', createdAt: new Date().toISOString().slice(0,10) })
      toast.success(`Đã tạo tài khoản cho ${form.name}`)
      onClose()
    } catch {
      toast.error('Có lỗi xảy ra')
    } finally { setLoading(false) }
  }

  return (
    <ModalShell title="Thêm người dùng" icon={<Plus size={16} />} onClose={onClose}>
      <div className="space-y-4">

        <Field label="Họ và tên" error={errors.name}>
          <input
            value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Nguyễn Văn A"
            className={fieldCls(errors.name)}
          />
        </Field>

        {/* Email */}
        <Field label="Email" error={errors.email}>
          <input
            type="email" value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="example@tluhub.vn"
            className={fieldCls(errors.email)}
          />
        </Field>

        {/* Role */}
        <Field label="Vai trò">
          <select value={form.role} onChange={e => set('role', e.target.value)} className={fieldCls()}>
            <option value="User">User</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
        </Field>

        {/* Auto password */}
        <Field label="Mật khẩu (tự động)">
          <div className="relative">
            <input
              readOnly value={password} type={showPw ? 'text' : 'password'}
              className={`${fieldCls()} pr-20 font-mono tracking-widest`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <button onClick={() => setShowPw(p => !p)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: '#8b7bb5' }}>
                {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button onClick={copyPw}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: copied ? '#34d399' : '#8b7bb5' }}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
          </div>
          <p className="text-[11px] mt-1" style={{ color: '#5a4d7a' }}>
            Gửi mật khẩu này cho người dùng sau khi tạo.
          </p>
        </Field>
      </div>

      <ModalActions onClose={onClose} onSubmit={handleSubmit} loading={loading} submitLabel="Tạo tài khoản" />
    </ModalShell>
  )
}
export default AddUserModal