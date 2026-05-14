import { useRef, useState } from 'react'
import {
  Video, Plus, Search, MoreVertical,
  ChevronLeft, ChevronRight, Users,
  Calendar, Hash, Mail, Clock,
  Shield, ShieldOff, Trash2, Edit2,
  RefreshCw, Copy, Check, CheckCircle2,
  XCircle, AlertCircle, Play, Square,
} from 'lucide-react'
import { useGetMeetingsQuery } from '../../../redux/features/admin/adminApi'
import { useDeleteMeetingApiMutation } from '../../../redux/features/meetings/meetingsApi'
import toast from 'react-hot-toast'
import Loading from '../../../components/Loading'

// ─── Mock Data ───────────────────────────────────────────────────────────────
const SEED_MEETINGS = [
  { _id: '6a0367dda38b14bb79739e3c', meetingId: 4001, title: 'Họp chiến lược Q2', roomCode: '6ea96e3e', hostEmail: 'an.nguyen@tluhub.vn', status: 'scheduled', createdAt: '2026-05-12T16:18:38.075Z', totalParticipants: 0 },
  { _id: '6a0367dda38b14bb79739e3d', meetingId: 4002, title: 'Review Sprint 14', roomCode: 'a1b2c3d4', hostEmail: 'binh.tran@tluhub.vn', status: 'active', createdAt: '2026-05-11T09:00:00.000Z', totalParticipants: 7 },
  { _id: '6a0367dda38b14bb79739e3e', meetingId: 4003, title: 'Onboarding tháng 5', roomCode: 'f9e8d7c6', hostEmail: 'cuong.le@tluhub.vn', status: 'ended', createdAt: '2026-05-10T14:30:00.000Z', totalParticipants: 12 },
  { _id: '6a0367dda38b14bb79739e3f', meetingId: 4004, title: 'Demo sản phẩm mới', roomCode: 'b5a4c3d2', hostEmail: 'dung.pham@tluhub.vn', status: 'scheduled', createdAt: '2026-05-13T08:00:00.000Z', totalParticipants: 0 },
  { _id: '6a0367dda38b14bb79739e40', meetingId: 4005, title: 'Standup buổi sáng', roomCode: '1a2b3c4d', hostEmail: 'em.hoang@tluhub.vn', status: 'active', createdAt: '2026-05-13T08:30:00.000Z', totalParticipants: 4 },
  { _id: '6a0367dda38b14bb79739e41', meetingId: 4006, title: 'Phỏng vấn ứng viên', roomCode: 'zz99yy88', hostEmail: 'phuong.vu@tluhub.vn', status: 'ended', createdAt: '2026-05-09T10:00:00.000Z', totalParticipants: 3 },
  { _id: '6a0367dda38b14bb79739e42', meetingId: 4007, title: 'Họp ban giám đốc', roomCode: 'xx77ww66', hostEmail: 'an.nguyen@tluhub.vn', status: 'cancelled', createdAt: '2026-05-08T15:00:00.000Z', totalParticipants: 0 },
  { _id: '6a0367dda38b14bb79739e43', meetingId: 4008, title: 'Training AI Tools', roomCode: 'tt55ss44', hostEmail: 'binh.tran@tluhub.vn', status: 'scheduled', createdAt: '2026-05-14T13:00:00.000Z', totalParticipants: 0 },
  { _id: '6a0367dda38b14bb79739e44', meetingId: 4009, title: 'Workshop thiết kế UX', roomCode: 'rr33qq22', hostEmail: 'cuong.le@tluhub.vn', status: 'ended', createdAt: '2026-05-07T09:00:00.000Z', totalParticipants: 18 },
]

const PAGE_SIZE = 8

// ─── Style maps ──────────────────────────────────────────────────────────────
const STATUS_MAP = {
  scheduled: { bg: 'rgba(251,191,36,.12)', color: '#fbbf24', border: 'rgba(251,191,36,.28)', label: 'Đã lên lịch', Icon: Clock },
  active:    { bg: 'rgba(16,185,129,.12)', color: '#34d399', border: 'rgba(16,185,129,.28)', label: 'Đang diễn ra', Icon: Play },
  ended:     { bg: 'rgba(139,123,181,.1)', color: '#8b7bb5', border: 'rgba(139,123,181,.2)', label: 'Đã kết thúc', Icon: Square },
  cancelled: { bg: 'rgba(239,68,68,.1)',   color: '#f87171', border: 'rgba(239,68,68,.2)',   label: 'Đã hủy',        Icon: XCircle },
}

const AVATAR_COLORS = [
  'linear-gradient(135deg,#06b6d4,#3b82f6)',
  'linear-gradient(135deg,#a855f7,#7c3aed)',
  'linear-gradient(135deg,#f97316,#ef4444)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
]
const avatarColor = str => AVATAR_COLORS[(str?.charCodeAt(0) || 0) % AVATAR_COLORS.length]
const getInitials = (title = '') => title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.ended
  const { Icon } = s
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      <Icon size={10} />
      {s.label}
    </span>
  )
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} title="Copy"
      className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
      style={{ color: '#8b7bb5' }}>
      {copied ? <Check size={11} style={{ color: '#34d399' }} /> : <Copy size={11} />}
    </button>
  )
}

// ─── Action Menu ──────────────────────────────────────────────────────────────
function ActionMenu({ meeting, onDelete, onChangeStatus }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const menuHeight = 160
      const spaceBelow = window.innerHeight - rect.bottom

      const top = spaceBelow < menuHeight
        ? rect.top - menuHeight - 6
        : rect.bottom + 6

      setPos({ top, left: rect.right - 170 })
    }
    setOpen(p => !p)
  }

  return (
    <div>
      <button onClick={handleOpen} ref={btnRef}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
        style={{ color: '#8b7bb5' }}>
        <MoreVertical size={15} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[101] rounded-xl border border-[#2a2245] overflow-hidden min-w-[170px]"
            style={{ background: '#150f2a', top: pos.top, left: pos.left }}
          >
            <button className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
              style={{ color: '#8b7bb5' }} onClick={() => setOpen(false)}>
              <Edit2 size={13} /> Chỉnh sửa
            </button>

            {meeting.status === 'scheduled' && (
              <button className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
                style={{ color: '#34d399' }} onClick={() => { onChangeStatus(meeting._id, 'active'); setOpen(false) }}>
                <Play size={13} /> Bắt đầu ngay
              </button>
            )}

            {meeting.status === 'active' && (
              <button className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
                style={{ color: '#8b7bb5' }} onClick={() => { onChangeStatus(meeting._id, 'ended'); setOpen(false) }}>
                <Square size={13} /> Kết thúc phòng
              </button>
            )}

            {meeting.status === 'scheduled' && (
              <button className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
                style={{ color: '#f87171' }} onClick={() => { onChangeStatus(meeting._id, 'cancelled'); setOpen(false) }}>
                <XCircle size={13} /> Hủy lịch
              </button>
            )}

            <div style={{ borderTop: '1px solid #2a2245' }} />
            <button className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm hover:bg-red-500/10 transition-colors text-left"
              style={{ color: '#f87171' }} onClick={() => { onDelete(meeting.meetingId); setOpen(false) }}>
              <Trash2 size={13} /> Xóa phòng họp
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Add Meeting Modal ────────────────────────────────────────────────────────
function AddMeetingModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ title: '', hostEmail: '', status: 'scheduled' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Vui lòng nhập tiêu đề'
    if (!form.hostEmail.trim() || !/\S+@\S+\.\S+/.test(form.hostEmail)) e.hostEmail = 'Email không hợp lệ'
    setErrors(e)
    return !Object.keys(e)?.length
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    const newMeeting = {
      _id: Math.random().toString(36).slice(2),
      meetingId: 4000 + Math.floor(Math.random() * 1000),
      title: form.title,
      roomCode: Math.random().toString(36).slice(2, 10),
      hostEmail: form.hostEmail,
      status: form.status,
      createdAt: new Date().toISOString(),
      totalParticipants: 0,
    }
    onAdd(newMeeting)
    setLoading(false)
    onClose()
  }

  const fieldCls = err => `w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border transition-colors bg-[#0f0a1e] placeholder-[#5a4d7a] ${err ? 'border-red-500/50 focus:border-red-400' : 'border-[#2a2245] focus:border-cyan-500/60'}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-md rounded-2xl border border-[#2a2245] overflow-hidden" style={{ background: '#150f2a' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2245]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(6,182,212,.15)' }}>
              <Video size={14} style={{ color: '#22d3ee' }} />
            </div>
            <span className="text-sm font-semibold text-white">Tạo phòng họp mới</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#8b7bb5' }}>
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b7bb5' }}>Tiêu đề phòng họp</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Vd: Họp chiến lược tháng 6"
              className={fieldCls(errors.title)} />
            {errors.title && <p className="text-[11px] mt-1 text-red-400">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b7bb5' }}>Email chủ phòng</label>
            <input value={form.hostEmail} onChange={e => setForm(p => ({ ...p, hostEmail: e.target.value }))}
              placeholder="host@tluhub.vn"
              className={fieldCls(errors.hostEmail)} />
            {errors.hostEmail && <p className="text-[11px] mt-1 text-red-400">{errors.hostEmail}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b7bb5' }}>Trạng thái ban đầu</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className={fieldCls(false)}>
              <option value="scheduled">Đã lên lịch</option>
              <option value="active">Đang diễn ra</option>
            </select>
          </div>

          <div className="flex gap-3 mt-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm border border-[#2a2245] hover:bg-white/5 transition-colors"
              style={{ color: '#8b7bb5' }}>Hủy</button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-[2] py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#3b82f6)' }}>
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
              Tạo phòng họp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MeetingsManagement() {
  const [meetings, setMeetings] = useState(SEED_MEETINGS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)

  const {data:meetingsRaw, isLoaing:isMeetingsLoading}=useGetMeetingsQuery();
  const [deleteMeetingApi, {isLoading:isDeleteLoading}]=useDeleteMeetingApiMutation()
  console.log(meetingsRaw, "râ")

  const filtered = meetingsRaw?.filter(m => {
    const q = search.toLowerCase()
    const matchQ = !q || m.title.toLowerCase().includes(q) || m.hostEmail.toLowerCase().includes(q) || m.roomCode.toLowerCase().includes(q)
    const matchS = statusFilter === 'all' || m.status === statusFilter
    return matchQ && matchS
  })

  const totalPages = Math.max(1, Math.ceil(filtered?.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const addMeeting = m => { setMeetings(p => [m, ...p]); setPage(1) }
  const changeStatus = (id, status) => setMeetings(p => p.map(m => m._id === id ? { ...m, status } : m))

  const handleDeleteMeeting = async (id) => {
    try {
        await deleteMeetingApi(id).unwrap()
        toast.success("Xóa phòng họp thành công", { position: 'top-right' })
    } catch (error) {
        toast.error(error?.data?.message || 'Xóa phòng họp thất bại, thử lại sau', { position: 'top-right' })
    }
  }

  const stats = {
    total: meetings?.length,
    active: meetings?.filter(m => m?.status === 'active').length,
    scheduled: meetings?.filter(m => m?.status === 'scheduled').length,
    ended: meetings?.filter(m => m?.status === 'ended').length,
  }

  const formatDate = iso => {
    const d = new Date(iso)
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

    if(!isMeetingsLoading)  return (
    <div className="space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Tổng phòng họp',  val: stats.total,     color: '#22d3ee', bg: 'rgba(6,182,212,.1)',   Icon: Video },
          { label: 'Đang diễn ra',    val: stats.active,    color: '#34d399', bg: 'rgba(16,185,129,.1)',  Icon: Play },
          { label: 'Đã lên lịch',     val: stats.scheduled, color: '#fbbf24', bg: 'rgba(251,191,36,.1)',  Icon: Clock },
          { label: 'Đã kết thúc',     val: stats.ended,     color: '#8b7bb5', bg: 'rgba(139,123,181,.1)', Icon: Square },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 border border-[#2a2245]" style={{ background: '#150f2a' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: '#8b7bb5' }}>{s.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <s.Icon size={14} style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-white">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3.5 py-2.5 rounded-xl border border-[#2a2245] focus-within:border-cyan-500/50 transition-colors"
          style={{ background: '#0f0a1e' }}>
          <Search size={14} style={{ color: '#5a4d7a' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Tìm theo tiêu đề, email, mã phòng..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#5a4d7a] outline-none" />
        </div>

        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3.5 py-2.5 rounded-xl text-sm border border-[#2a2245] outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
          style={{ background: '#0f0a1e', color: '#8b7bb5' }}>
          <option value="all">Tất cả trạng thái</option>
          <option value="scheduled">Đã lên lịch</option>
          <option value="active">Đang diễn ra</option>
          <option value="ended">Đã kết thúc</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>
          <Plus size={15} />
          Tạo phòng họp
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#2a2245] overflow-hidden" style={{ background: '#150f2a' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f0a1e' }}>
                {['Phòng họp', 'Mã phòng', 'Chủ phòng', 'Trạng thái'
                // 'Người tham gia'
                , 'Ngày tạo', ''].map(h => (
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
                  <td colSpan={7} className="text-center py-12 text-sm" style={{ color: '#5a4d7a' }}>
                    Không tìm thấy phòng họp nào
                  </td>
                </tr>
              )}
              {pageData?.map((meeting, i) => (
                <tr key={meeting._id}
                  className="transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: i < pageData?.length - 1 ? '1px solid #1a1430' : 'none' }}>

                  {/* Title + avatar */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                        style={{ background: avatarColor(meeting.title) }}>
                        {getInitials(meeting.title)}
                      </div>
                      <div>
                        <span className="font-medium text-white whitespace-nowrap">{meeting.title}</span>
                        <p className="text-[11px] mt-0.5" style={{ color: '#5a4d7a' }}>#{meeting.meetingId}</p>
                      </div>
                    </div>
                  </td>

                  {/* Room code */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs px-2 py-1 rounded-lg border border-[#2a2245] inline-flex items-center gap-1"
                      style={{ background: '#0f0a1e', color: '#22d3ee' }}>
                      <Hash size={10} />
                      {meeting.roomCode}
                      <CopyBtn text={meeting.roomCode} />
                    </span>
                  </td>

                  {/* Host email */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Mail size={11} style={{ color: '#5a4d7a' }} />
                      <span className="text-xs" style={{ color: '#8b7bb5' }}>{meeting.hostEmail}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3"><StatusBadge status={meeting.status} /></td>

                  {/* Participants */}
                  {/* <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Users size={12} style={{ color: '#5a4d7a' }} />
                      <span className="text-xs font-medium"
                        style={{ color: meeting.totalParticipants > 0 ? '#c4b5fd' : '#5a4d7a' }}>
                        {meeting.totalParticipants}
                      </span>
                    </div>
                  </td> */}

                  {/* Date */}
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#5a4d7a', fontSize: 12 }}>
                    {formatDate(meeting.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <ActionMenu meeting={meeting} onDelete={handleDeleteMeeting} onChangeStatus={changeStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#2a2245]">
          <span className="text-xs" style={{ color: '#5a4d7a' }}>
            {filtered.length} phòng họp · trang {currentPage}/{totalPages}
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

      {modal === 'add' && <AddMeetingModal onClose={() => setModal(null)} onAdd={addMeeting} />}
        {isDeleteLoading&& isMeetingsLoading&& <Loading />}
    </div>
  )
}