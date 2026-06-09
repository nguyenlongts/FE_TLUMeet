import { useRef, useState } from 'react'
import {
  Video, Plus, Search, MoreVertical,
  ChevronLeft, ChevronRight, Users,
  Calendar, Hash, Mail, Clock,
  Shield, ShieldOff, Trash2, Edit2,
  RefreshCw, Copy, Check, CheckCircle2,
  XCircle, AlertCircle, Play, Square, FileSpreadsheet,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { useGetMeetingsQuery } from '../../../redux/features/admin/adminApi'
import {
  useDeleteMeetingApiMutation,
  useScheduleMeetingMutation,
  useStartMeetingMutation,
  useEndMeetingMutation,
} from '../../../redux/features/meetings/meetingsApi'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
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
  scheduled:      { bg: 'rgba(251,191,36,.12)', color: '#fbbf24', border: 'rgba(251,191,36,.28)', i18nKey: 'admin.meetings.status.scheduled',      Icon: Clock },
  live:           { bg: 'rgba(16,185,129,.12)', color: '#34d399', border: 'rgba(16,185,129,.28)', i18nKey: 'admin.meetings.status.live',           Icon: Play },
  waitingForHost: { bg: 'rgba(168,85,247,.12)', color: '#c084fc', border: 'rgba(168,85,247,.28)', i18nKey: 'admin.meetings.status.waitingForHost', Icon: AlertCircle },
  ended:          { bg: 'rgba(139,123,181,.1)', color: '#8b7bb5', border: 'rgba(139,123,181,.2)', i18nKey: 'admin.meetings.status.ended',          Icon: Square },
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const { t } = useTranslation()
  const s = STATUS_MAP[status] || STATUS_MAP.ended
  const { Icon } = s
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      <Icon size={10} />
      {t(s.i18nKey)}
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
  const { t } = useTranslation()
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
              <Edit2 size={13} /> {t('admin.meetings.actions.edit')}
            </button>

            {(meeting.status === 'scheduled' || meeting.status === 'waitingForHost') && (
              <button className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
                style={{ color: '#34d399' }} onClick={() => { onChangeStatus(meeting.roomCode, 'start'); setOpen(false) }}>
                <Play size={13} /> {t('admin.meetings.actions.start')}
              </button>
            )}

            {meeting.status === 'live' && (
              <button className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
                style={{ color: '#8b7bb5' }} onClick={() => { onChangeStatus(meeting.roomCode, 'end'); setOpen(false) }}>
                <Square size={13} /> {t('admin.meetings.actions.end')}
              </button>
            )}

            <div style={{ borderTop: '1px solid #2a2245' }} />
            <button className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm hover:bg-red-500/10 transition-colors text-left"
              style={{ color: '#f87171' }} onClick={() => { onDelete(meeting.meetingId); setOpen(false) }}>
              <Trash2 size={13} /> {t('admin.meetings.actions.delete')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Add Meeting Modal ────────────────────────────────────────────────────────
function AddMeetingModal({ onClose, onAdd }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    title: '',
    description: '',
    hostEmail: '',
    scheduledDateTime: '',
    duration: 60,
    requireHostToStart: false,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = t('admin.meetings.addModal.validation.titleRequired')
    if (!form.hostEmail.trim() || !/\S+@\S+\.\S+/.test(form.hostEmail)) e.hostEmail = t('admin.meetings.addModal.validation.hostEmailInvalid')
    if (!form.duration || form.duration <= 0) e.duration = t('admin.meetings.addModal.validation.durationInvalid')
    setErrors(e)
    return !Object.keys(e)?.length
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await onAdd({
        Title: form.title.trim(),
        Description: form.description.trim() || null,
        HostEmail: form.hostEmail.trim(),
        ScheduledDateTime: form.scheduledDateTime ? new Date(form.scheduledDateTime).toISOString() : null,
        Duration: Number(form.duration),
        RequireHostToStart: form.requireHostToStart,
      })
      onClose()
    } finally {
      setLoading(false)
    }
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
            <span className="text-sm font-semibold text-white">{t('admin.meetings.addModal.title')}</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#8b7bb5' }}>
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b7bb5' }}>{t('admin.meetings.addModal.titleLabel')}</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder={t('admin.meetings.addModal.titlePlaceholder')}
              className={fieldCls(errors.title)} />
            {errors.title && <p className="text-[11px] mt-1 text-red-400">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b7bb5' }}>{t('admin.meetings.addModal.hostEmailLabel')}</label>
            <input value={form.hostEmail} onChange={e => setForm(p => ({ ...p, hostEmail: e.target.value }))}
              placeholder={t('admin.meetings.addModal.hostEmailPlaceholder')}
              className={fieldCls(errors.hostEmail)} />
            {errors.hostEmail && <p className="text-[11px] mt-1 text-red-400">{errors.hostEmail}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b7bb5' }}>{t('admin.meetings.addModal.descriptionLabel')}</label>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder={t('admin.meetings.addModal.descriptionPlaceholder')}
              className={fieldCls(false)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b7bb5' }}>{t('admin.meetings.addModal.scheduledDateTimeLabel')}</label>
              <input type="datetime-local" value={form.scheduledDateTime}
                onChange={e => setForm(p => ({ ...p, scheduledDateTime: e.target.value }))}
                className={fieldCls(false)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b7bb5' }}>{t('admin.meetings.addModal.durationLabel')}</label>
              <input type="number" min="1" value={form.duration}
                onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                className={fieldCls(errors.duration)} />
              {errors.duration && <p className="text-[11px] mt-1 text-red-400">{errors.duration}</p>}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: '#8b7bb5' }}>
            <input type="checkbox" checked={form.requireHostToStart}
              onChange={e => setForm(p => ({ ...p, requireHostToStart: e.target.checked }))} />
            {t('admin.meetings.addModal.requireHostToStart')}
          </label>

          <div className="flex gap-3 mt-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm border border-[#2a2245] hover:bg-white/5 transition-colors"
              style={{ color: '#8b7bb5' }}>{t('admin.meetings.addModal.cancel')}</button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-[2] py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#3b82f6)' }}>
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
              {t('admin.meetings.addModal.submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MeetingsManagement() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)

  const {data:meetingsRaw, refetch}=useGetMeetingsQuery();
  const [deleteMeetingApi, {isLoading:isDeleteLoading}]=useDeleteMeetingApiMutation()
  const [scheduleMeeting] = useScheduleMeetingMutation()
  const [startMeeting] = useStartMeetingMutation()
  const [endMeeting] = useEndMeetingMutation()

  const filtered = meetingsRaw?.filter(m => {
    const q = search.toLowerCase()
    const matchQ = !q || m.title?.toLowerCase().includes(q) || m.hostEmail?.toLowerCase().includes(q) || m.roomCode?.toLowerCase().includes(q)
    const matchS = statusFilter === 'all' || m.status === statusFilter
    return matchQ && matchS
  })

  const totalPages = Math.max(1, Math.ceil(filtered?.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageData = filtered?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const addMeeting = async (payload) => {
    try {
      await scheduleMeeting(payload).unwrap()
      toast.success(t('admin.meetings.toast.createSuccess'))
      setPage(1)
      setTimeout(refetch, 800) // chờ Kafka đẩy event sang admin-service
    } catch (err) {
      toast.error(err?.data?.message || t('admin.meetings.toast.createError'))
    }
  }

  const changeStatus = async (roomCode, action) => {
    try {
      const fn = action === 'start' ? startMeeting : endMeeting
      await fn(roomCode).unwrap()
      toast.success(action === 'start' ? t('admin.meetings.toast.startSuccess') : t('admin.meetings.toast.endSuccess'))
      setTimeout(refetch, 800)
    } catch (err) {
      toast.error(err?.data?.message || t('admin.meetings.toast.actionFailed'))
    }
  }

  const handleDeleteMeeting = async (id) => {
    try {
        await deleteMeetingApi(id).unwrap()
        toast.success(t('admin.meetings.toast.deleteSuccess'), { position: 'top-right' })
    } catch (error) {
        toast.error(error?.data?.message || t('admin.meetings.toast.deleteError'), { position: 'top-right' })
    }
  }

  const stats = {
    total: meetingsRaw?.length ?? 0,
    active: meetingsRaw?.filter(m => m?.status === 'live').length ?? 0,
    scheduled: meetingsRaw?.filter(m => m?.status === 'scheduled').length ?? 0,
    ended: meetingsRaw?.filter(m => m?.status === 'ended').length ?? 0,
  }

  const formatDate = iso => {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const exportExcel = () => {
    const rows = (filtered ?? []).map(m => ({
      ID: m.meetingId,
      [t('admin.meetings.table.title', 'Tiêu đề')]: m.title,
      [t('admin.meetings.table.roomCode', 'Mã phòng')]: m.roomCode,
      [t('admin.meetings.table.host', 'Host')]: m.hostEmail,
      [t('admin.meetings.table.status', 'Trạng thái')]: m.status,
      [t('admin.meetings.table.participants', 'Số người')]: m.totalParticipants ?? 0,
      [t('admin.meetings.table.createdAt', 'Ngày tạo')]: m.createdAt ? new Date(m.createdAt).toLocaleString() : '',
    }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{}]), 'Meetings')
    const ts = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(wb, `tlu-meetings-${ts}.xlsx`)
  }

  return (
    <div className="space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: t('admin.meetings.cards.total'),     val: stats.total,     color: '#22d3ee', bg: 'rgba(6,182,212,.1)',   Icon: Video },
          { label: t('admin.meetings.cards.live'),      val: stats.active,    color: '#34d399', bg: 'rgba(16,185,129,.1)',  Icon: Play },
          { label: t('admin.meetings.cards.scheduled'), val: stats.scheduled, color: '#fbbf24', bg: 'rgba(251,191,36,.1)',  Icon: Clock },
          { label: t('admin.meetings.cards.ended'),     val: stats.ended,     color: '#8b7bb5', bg: 'rgba(139,123,181,.1)', Icon: Square },
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
            placeholder={t('admin.meetings.searchPlaceholder')}
            className="flex-1 bg-transparent text-sm text-white placeholder-[#5a4d7a] outline-none" />
        </div>

        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3.5 py-2.5 rounded-xl text-sm border border-[#2a2245] outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
          style={{ background: '#0f0a1e', color: '#8b7bb5' }}>
          <option value="all">{t('admin.meetings.filters.all')}</option>
          <option value="scheduled">{t('admin.meetings.filters.scheduled')}</option>
          <option value="live">{t('admin.meetings.filters.live')}</option>
          <option value="waitingForHost">{t('admin.meetings.filters.waitingForHost')}</option>
          <option value="ended">{t('admin.meetings.filters.ended')}</option>
        </select>

        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>
          <Plus size={15} />
          {t('admin.meetings.createButton')}
        </button>
        <button
          onClick={exportExcel}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-colors"
        >
          <FileSpreadsheet size={15} />
          {t('admin.meetings.exportButton', 'Xuất Excel')}
        </button>
        <button
          onClick={refetch}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#2a2245] hover:bg-white/5 transition-colors"
          style={{ color: '#8b7bb5' }}
          title="Tải lại"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#2a2245] overflow-hidden" style={{ background: '#150f2a' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f0a1e' }}>
                {[
                  t('admin.meetings.table.meeting'),
                  t('admin.meetings.table.roomCode'),
                  t('admin.meetings.table.host'),
                  t('admin.meetings.table.status'),
                  t('admin.meetings.table.createdAt'),
                  ''
                ].map((h, idx) => (
                  <th key={idx} className="text-left px-4 py-3 text-xs font-medium whitespace-nowrap"
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
                    {t('admin.meetings.table.empty')}
                  </td>
                </tr>
              )}
              {pageData?.map((meeting, i) => (
                <tr key={meeting._id}
                  className="transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: i < pageData?.length - 1 ? '1px solid #1a1430' : 'none' }}>

                  {/* Title */}
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium text-white whitespace-nowrap">{meeting.title}</span>
                      <p className="text-[11px] mt-0.5" style={{ color: '#5a4d7a' }}>#{meeting.meetingId}</p>
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
            {t('admin.meetings.table.summary', { count: filtered?.length ?? 0, current: currentPage, total: totalPages })}
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
      {isDeleteLoading && <Loading text={t('admin.meetings.toast.deleteLoading')} />}
    </div>
  )
}