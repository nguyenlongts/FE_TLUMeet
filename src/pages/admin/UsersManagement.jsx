import { useState, useRef, useCallback } from 'react'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'
import {
  Users, Plus, Upload, Search, MoreVertical,
  X, Download, FileSpreadsheet, CheckCircle2,
  AlertCircle, Trash2, Edit2, Eye, EyeOff,
  RefreshCw, ChevronLeft, ChevronRight,
  Shield, ShieldOff, Copy, Check,
} from 'lucide-react'
import AddUserModal from '../../components/AddUserModal'
import ModalShell from '../../components/ModalShell'
import { useDeleteUserMutation, useGetUsersQuery } from '../../redux/features/admin/adminApi'


const genPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const getInitials = (name = '') =>
  name.split(' ')?.slice(-2).map(w => w[0]).join('').toUpperCase() || '?'

const AVATAR_COLORS = [
  'linear-gradient(135deg,#a855f7,#7c3aed)',
  'linear-gradient(135deg,#f97316,#ef4444)',
  'linear-gradient(135deg,#06b6d4,#3b82f6)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
]
const avatarColor = (name = '') =>
  AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length]

const ROLE_STYLES = {
  Admin:   { bg: 'rgba(168,85,247,.15)', color: '#c084fc', border: 'rgba(168,85,247,.3)' },
  User:    { bg: 'rgba(139,123,181,.1)', color: '#8b7bb5', border: 'rgba(139,123,181,.2)' },
  Manager: { bg: 'rgba(6,182,212,.12)',  color: '#22d3ee', border: 'rgba(6,182,212,.25)' },
}

const STATUS_STYLES = {
  true:   { bg: 'rgba(16,185,129,.12)', color: '#34d399', border: 'rgba(16,185,129,.25)', label: 'Active' },
  false: { bg: 'rgba(239,68,68,.1)',   color: '#f87171', border: 'rgba(239,68,68,.2)',   label: 'Inactive' },
}



const SEED_USERS = [
  { id: 1, name: 'Nguyễn Văn An',   email: 'an.nguyen@tluhub.vn',   role: 'Admin',   status: 'active',   createdAt: '2024-01-10' },
  { id: 2, name: 'Trần Thị Bình',   email: 'binh.tran@tluhub.vn',   role: 'Manager', status: 'active',   createdAt: '2024-02-14' },
  { id: 3, name: 'Lê Minh Cường',   email: 'cuong.le@tluhub.vn',    role: 'User',    status: 'inactive', createdAt: '2024-03-05' },
  { id: 4, name: 'Phạm Thị Dung',   email: 'dung.pham@tluhub.vn',   role: 'User',    status: 'active',   createdAt: '2024-03-21' },
  { id: 5, name: 'Hoàng Văn Em',    email: 'em.hoang@tluhub.vn',    role: 'User',    status: 'active',   createdAt: '2024-04-01' },
  { id: 6, name: 'Vũ Thị Phương',   email: 'phuong.vu@tluhub.vn',   role: 'Manager', status: 'inactive', createdAt: '2024-04-15' },
]

const PAGE_SIZE = 8


function ImportModal({ onClose, onImport }) {
  const fileRef = useRef()
  const [dragging,  setDragging]  = useState(false)
  const [rows,      setRows]      = useState([])  // { email, name?, role?, status, error }
  const [step,      setStep]      = useState('upload') // upload | preview | done
  const [loading,   setLoading]   = useState(false)
  const [roleDefault, setRoleDefault] = useState('User')

  const processFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        // find email column (header row)
        const headers = (data[0] || []).map(h => String(h).toLowerCase().trim())
        const emailCol = headers.findIndex(h => h.includes('email'))
        const nameCol  = headers.findIndex(h => h.includes('name') || h.includes('tên'))
        const roleCol  = headers.findIndex(h => h.includes('role') || h.includes('vai'))

        const parsed = data?.slice(1).map((row, i) => {
          const email = emailCol >= 0 ? String(row[emailCol]).trim() : ''
          const name  = nameCol  >= 0 ? String(row[nameCol]).trim()  : ''
          const role  = roleCol  >= 0 ? String(row[roleCol]).trim()  : roleDefault
          const valid = /\S+@\S+\.\S+/.test(email)
          return { id: i, email, name, role: role || roleDefault, password: genPassword(), error: valid ? null : 'Email không hợp lệ' }
        }).filter(r => r.email)

        setRows(parsed)
        setStep('preview')
      } catch {
        toast.error('File không hợp lệ')
      }
    }
    reader.readAsBinaryString(file)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    processFile(e.dataTransfer.files[0])
  }, [roleDefault])

  const validRows   = rows.filter(r => !r.error)
  const invalidRows = rows.filter(r =>  r.error)

  const handleImport = async () => {
    if (!validRows.length) return
    setLoading(true)
    try {
      // await api.bulkCreateUsers(validRows)
      await new Promise(r => setTimeout(r, 1000))
      onImport(validRows.map(r => ({
        id: Date.now() + Math.random(),
        name:      r.name || r.email.split('@')[0],
        email:     r.email,
        role:      r.role,
        status:    'active',
        createdAt: new Date().toISOString()?.slice(0,10),
      })))
      setStep('done')
    } catch {
      toast.error('Import thất bại')
    } finally { setLoading(false) }
  }

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([['Email', 'Name', 'Role'], ['example@email.com', 'Nguyễn Văn A', 'User']])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Users')
    XLSX.writeFile(wb, 'tluhub_users_template.xlsx')
  }

  return (
    <ModalShell title="Import từ Excel" icon={<FileSpreadsheet size={16} />} onClose={onClose} wide>
      {step === 'upload' && (
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current.click()}
            className="cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center py-10 gap-3"
            style={{
              borderColor: dragging ? '#a855f7' : '#2a2245',
              background: dragging ? 'rgba(168,85,247,.06)' : '#0f0a1e',
            }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,.15)' }}>
              <Upload size={22} style={{ color: '#a855f7' }} />
            </div>
            <div className="text-center">
              <p className="text-white text-sm font-medium">Kéo thả file vào đây</p>
              <p className="text-xs mt-1" style={{ color: '#5a4d7a' }}>hoặc click để chọn file .xlsx / .xls</p>
            </div>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
            onChange={e => processFile(e.target.files[0])} />

          <Field label="Vai trò mặc định">
            <select value={roleDefault} onChange={e => setRoleDefault(e.target.value)} className={fieldCls()}>
              <option value="User">User</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </Field>

          {/* Template download */}
          <button onClick={downloadTemplate}
            className="flex items-center gap-2 text-sm transition-colors hover:text-violet-300"
            style={{ color: '#8b7bb5' }}>
            <Download size={14} />
            Tải file mẫu (.xlsx)
          </button>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Tổng',      val: rows.length,       color: '#a855f7' },
              { label: 'Hợp lệ',   val: validRows.length,  color: '#34d399' },
              { label: 'Lỗi',      val: invalidRows.length, color: '#f87171' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3 border border-[#2a2245]" style={{ background: '#0f0a1e' }}>
                <p className="text-xs mb-1" style={{ color: '#5a4d7a' }}>{s.label}</p>
                <p className="text-xl font-semibold" style={{ color: s.color }}>{s.val}</p>
              </div>
            ))}
          </div>

          {/* Table preview */}
          <div className="rounded-xl border border-[#2a2245] overflow-hidden" style={{ maxHeight: 260, overflowY: 'auto' }}>
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead style={{ background: '#0f0a1e', position: 'sticky', top: 0 }}>
                <tr>
                  {['Email', 'Tên', 'Vai trò', 'Mật khẩu', ''].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-xs font-medium" style={{ color: '#5a4d7a', borderBottom: '1px solid #2a2245' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #1a1430' }}>
                    <td className="px-3 py-2.5">
                      <span className={row.error ? 'line-through' : ''} style={{ color: row.error ? '#f87171' : '#c4b5fd', fontSize: 12 }}>{row.email}</span>
                    </td>
                    <td className="px-3 py-2.5" style={{ color: '#8b7bb5', fontSize: 12 }}>{row.name || '—'}</td>
                    <td className="px-3 py-2.5">
                      <RoleBadge role={row.role} />
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-[11px]" style={{ color: '#5a4d7a' }}>{row.password.slice(0,4)}••••</span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {row.error
                        ? <span title={row.error}><AlertCircle size={14} style={{ color: '#f87171' }} /></span>
                        : <CheckCircle2 size={14} style={{ color: '#34d399' }} />
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('upload')}
              className="flex-1 py-2.5 rounded-xl text-sm border border-[#2a2245] transition-colors hover:bg-white/5"
              style={{ color: '#8b7bb5' }}>
              Chọn lại
            </button>
            <button onClick={handleImport} disabled={!validRows.length || loading}
              className="flex-[2] py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
              Import {validRows.length} người dùng
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center py-6 gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,.15)' }}>
            <CheckCircle2 size={32} style={{ color: '#34d399' }} />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-lg">Import thành công!</p>
            <p className="text-sm mt-1" style={{ color: '#8b7bb5' }}>
              Đã tạo {validRows.length} tài khoản. Mật khẩu đã được gán ngẫu nhiên.
            </p>
          </div>
          <button onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>
            Hoàn tất
          </button>
        </div>
      )}
    </ModalShell>
  )
}


const fieldCls = (err) =>
  `w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border transition-colors
   bg-[#0f0a1e] placeholder-[#5a4d7a]
   ${err ? 'border-red-500/50 focus:border-red-400' : 'border-[#2a2245] focus:border-violet-500/60'}`

// function Field({ label, error, children }) {
//   return (
//     <div>
//       <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b7bb5' }}>{label}</label>
//       {children}
//       {error && <p className="text-[11px] mt-1 text-red-400">{error}</p>}
//     </div>
//   )
// }

function RoleBadge({ role }) {
  const s = ROLE_STYLES[role] || ROLE_STYLES.User
  return (
    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md border uppercase"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {role}
    </span>
  )
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.inactive
  return (
    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {s.label}
    </span>
  )
}


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



function ActionMenu({ user, onToggleStatus, onDelete }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const menuHeight = 120 
      const spaceBelow = window.innerHeight - rect.bottom

      const top = spaceBelow < menuHeight
        ? rect.top - menuHeight - 6  
        : rect.bottom + 6            

      setPos({
        top,
        left: rect.right - 160,
      })
    }
    setOpen(p => !p)
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
        style={{ color: '#8b7bb5' }}>
        <MoreVertical size={15} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[101] rounded-xl border border-[#2a2245] overflow-hidden min-w-[160px]"
            style={{ background: '#150f2a', top: pos.top, left: pos.left }}>
            <button
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
              style={{ color: '#8b7bb5' }}
              onClick={() => setOpen(false)}>
              <Edit2 size={13} /> Chỉnh sửa
            </button>
            <button
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
              style={{ color: user?.isActive === true ? '#f87171' : '#34d399' }}
              onClick={() => { onToggleStatus(user.id); setOpen(false) }}>
              {user?.isActive === true
                ? <><ShieldOff size={13} /> Vô hiệu hóa</>
                : <><Shield size={13} /> Kích hoạt</>}
            </button>
            <div style={{ borderTop: '1px solid #2a2245' }} />
            <button
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm hover:bg-red-500/10 transition-colors text-left"
              style={{ color: '#f87171' }}
              onClick={() => { onDelete(user.userId); setOpen(false) }}>
              <Trash2 size={13} /> Xóa người dùng
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const initials = name =>
  name.split(" ").slice(-2).map(w => w[0].toUpperCase()).join("")
export default function UsersManagement() {
  const [users,  setUsers]  = useState(SEED_USERS)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter]     = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null) 

  const {data:usersData, isLoading:isUsersLoading} =  useGetUsersQuery()
  const [deleteUser, {isLoading:isDeleteUserLoading}] = useDeleteUserMutation()
  console.log(usersData, "usersData")
  const filtered = usersData?.filter(u => {
    const q = search.toLowerCase()
    const matchQ = !q || u.userName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchR = roleFilter   === 'all' || u.role   === roleFilter
    const matchS = statusFilter === 'all' || u.isActive === (statusFilter === 'active')
    return matchQ && matchR && matchS
  })

  const totalPages = Math.max(1, Math.ceil(filtered?.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageData = filtered?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const addUser          = (u) => { setUsers(p => [u, ...p]); setPage(1) }
  const addUsers         = (arr) => { setUsers(p => [...arr, ...p]); setPage(1); toast.success(`Đã import ${arr?.length} người dùng`) }
  const toggleStatus     = (id) => setUsers(p => p.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u))
  // const deleteUser       = (id) => { setUsers(p => p.filter(u => u.id !== id)); toast.success('Đã xóa người dùng') }

  const handledeleteUser =async(id)=>{
    try {
      const res= await deleteUser(id).unwrap()
      toast.success("Xóa người dùng thành công")
    } catch (error) {
      toast.error("Xảy ra lỗi khi xóa người dùng")
    }
  } 

  const stats = {
    total:    usersData?.length || 0,
    active:   usersData?.filter(u => u.isActive === true).length || 0,
    inactive: usersData?.filter(u => u.isActive === false).length || 0,
  }

  if(!isUsersLoading)return (
    <div className="space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tổng người dùng', val: stats.total,    color: 'white', bg: 'from-violet-600 to-violet-800' },
          { label: 'Đang hoạt động',  val: stats.active,   color: 'white', bg: 'from-emerald-600 to-emerald-800' },
          { label: 'Vô hiệu hóa',     val: stats.inactive, color: 'white', bg: 'from-pink-600 to-pink-800' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 border border-[#2a2245]" style={{ background: '#150f2a' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: '#8b7bb5' }}>{s.label}</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${s.bg}`} >
                <Users size={14} style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-white">{s.val}</p>
          </div>
        ))}
      </div>


      <div className="flex flex-wrap items-center gap-3">

        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3.5 py-2.5 rounded-xl border border-[#2a2245] focus-within:border-violet-500/50 transition-colors"
          style={{ background: '#0f0a1e' }}>
          <Search size={14} style={{ color: '#5a4d7a' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Tìm theo tên, email..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#5a4d7a] outline-none" />
        </div>


        {[
          { val: roleFilter,   set: v => { setRoleFilter(v);   setPage(1) }, opts: [['all','Tất cả vai trò'],['Admin','Admin'],['Manager','Manager'],['User','User']] },
          { val: statusFilter, set: v => { setStatusFilter(v); setPage(1) }, opts: [['all','Tất cả trạng thái'],['active','Active'],['inactive','Inactive']] },
        ].map((f, i) => (
          <select key={i} value={f.val} onChange={e => f.set(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl text-sm border border-[#2a2245] outline-none focus:border-violet-500/50 transition-colors cursor-pointer"
            style={{ background: '#0f0a1e', color: '#8b7bb5' }}>
            {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}

        {/* Import Excel */}
        <button onClick={() => setModal('import')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-[#2a2245] hover:bg-white/5 transition-colors"
          style={{ color: '#8b7bb5' }}>
          <FileSpreadsheet size={15} />
          Import Excel
        </button>

        {/* Add single */}
        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>
          <Plus size={15} />
          Thêm người dùng
        </button>
      </div>


      <div className="rounded-2xl border border-[#2a2245] overflow-hidden" style={{ background: '#150f2a' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f0a1e' }}>
                {['Người dùng', 'Email', 'Vai trò', 'Trạng thái', 'Ngày tạo', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium whitespace-nowrap"
                    style={{ color: '#5a4d7a', borderBottom: '1px solid #2a2245' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm" style={{ color: '#5a4d7a' }}>
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              )}
              {filtered?.map((user, i) => (
                <tr key={user.id}
                  className="transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: i < pageData?.length - 1 ? '1px solid #1a1430' : 'none' }}>
                  {/* Name + avatar */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                        style={{ background: avatarColor(user.name) }}>
                        {getInitials(user.name)}
                      </div>
                      <span className="font-medium text-white whitespace-nowrap">{user?.userName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: '#8b7bb5' }}>{user.email}</td>
                  <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                  <td className="px-4 py-3"><StatusBadge status={user.isActive} /></td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#5a4d7a', fontSize: 12 }}>{user.createdAt}</td>
                  <td className="px-4 py-3 text-right">
                    <ActionMenu user={user} onToggleStatus={toggleStatus} onDelete={handledeleteUser} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        <div className="flex items-center justify-between px-4 py-3 border-t border-[#2a2245]">
          <span className="text-xs" style={{ color: '#5a4d7a' }}>
            {filtered?.length} người dùng · trang {currentPage}/{totalPages}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#2a2245] disabled:opacity-30 hover:bg-white/5 transition-colors"
              style={{ color: '#8b7bb5' }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#2a2245] disabled:opacity-30 hover:bg-white/5 transition-colors"
              style={{ color: '#8b7bb5' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {modal === 'add'    && <AddUserModal  onClose={() => setModal(null)} onAdd={addUser} />}
      {modal === 'import' && <ImportModal   onClose={() => setModal(null)} onImport={addUsers} />}
    </div>
  )
}