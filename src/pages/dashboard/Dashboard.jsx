import { Video, Plus, ArrowRight, CalendarDays, Clock, VideoOff } from 'lucide-react'
import MeetingCard from '../../components/MeetingCard'
import StatCard from '../../components/StatCard'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../redux/features/auth/authSlice'
import { useEffect, useState } from 'react'
import { useDeleteMeetingApiMutation, useGetAllMeetingByEmailQuery, useGetMeetingInvitedQuery, useJoinMeetingMutation, useLazyCheckRoomCodeQuery } from '../../redux/features/meetings/meetingsApi'
import ScheduleMeetingModal from '../meetings/ScheduleMeetingModal'
import { Form, Input, Button } from 'antd'
import WaitingRoom from '../meetings/WaitingRoom'
import { useNavigate } from 'react-router-dom'
import DeleteConfirmModal from '../../components/DeleteConfirmModal'
import { useTranslation } from 'react-i18next'
import Loading from '../../components/Loading'
import { getActiveMeeting } from '../../utils/activeMeeting'
import { useSearch } from '../../context/SearchContext'

// ─── JoinLinkModal ────────────────────────────────────────────────────────────
const JoinLinkModal = ({ isOpen, onClose, pushRoomCode, handleWaiting }) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [roomCode, setRoomCode] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const user = useSelector(selectCurrentUser)
  const [checkRoomCode] = useLazyCheckRoomCodeQuery()
  const [joinMeeting, { error }] = useJoinMeetingMutation()

  const handleSubmit = async ({ roomCode }) => {
    const active = getActiveMeeting();
    if (active) {
      toast.error(t('common.alreadyInMeeting'));
      return;
    }
    setIsLoading(true)
    setRoomCode(roomCode)
    handleWaiting()
    setRoomCode(roomCode)
    try {
      const resCheckRoomCode = await checkRoomCode(roomCode).unwrap()
      console.log(resCheckRoomCode)
      if (!resCheckRoomCode?.statusCode === 200 || !resCheckRoomCode) {
        form.setFields([{ name: 'roomCode', errors: t('joinModal.error.notFound') }])
        return
      }
      const formJoin = {
        roomCode: roomCode,
        userEmail: user.email,
        guestName: user.name,
      }
      const res = await joinMeeting(formJoin).unwrap()
      console.log(res)
      if (error) { console.log(error) }
      if (!error) { onClose() }
      sessionStorage.setItem('joinToken', res?.data?.joinToken)
      pushRoomCode(roomCode)
    } catch (err) {
      console.log(err)
      form.setFields([{
        name: 'roomCode',
        errors: [err?.data?.message || t('joinModal.error.serverError')],
      }])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[var(--content)] font-semibold text-lg">{t('joinModal.title')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-[var(--content)] transition-colors">
            ✕
          </button>
        </div>

        {/* Form */}
        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item
            label={
              <span className="text-[11px] tracking-widest text-[var(--faint)] font-medium">
                {t('joinModal.roomCodeLabel')}
              </span>
            }
            name="roomCode"
            rules={[
              { required: true, message: t('joinModal.validation.required') },
              { min: 6, message: t('joinModal.validation.minLength') },
            ]}
            normalize={(val) => val.toUpperCase()}
          >
            <Input placeholder={t('joinModal.roomCodePlaceholder')} className="!font-mono" />
          </Form.Item>

          <Form.Item className="!mb-0 !mt-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              className="!h-11 !rounded-xl !font-medium !text-sm !bg-gradient-to-r !from-[var(--accent)] !to-[var(--accent)] !border-0 group"
              icon={
                !isLoading && (
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                )
              }
              iconPosition="end"
            >
              {isLoading ? t('joinModal.joiningButton') : t('joinModal.joinButton')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const parseUtc = (dateStr) => new Date(dateStr + 'Z')

const getMeetingState = (meeting) => {
  const { status, scheduledDateTime, duration } = meeting
  const start = parseUtc(scheduledDateTime)
  const end = new Date(start.getTime() + duration * 60_000)
  const now = new Date()

  if (status === 'Ended' || status === 3) return 'expired'
  if (status !== 'Live' && status !== 2 && now > end) return 'expired'
  if (status === 'Live' || status === 2) return 'live'
  if (status === 'WaitingForHost' || status === 1) return 'waiting'
  return 'upcoming'
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const { search } = useSearch()
  const [type, setType] = useState('')
  // refetchOnMountOrArgChange: mỗi lần vào lại dashboard (vd. sau khi bị host end meeting
  // và bị đưa về đây) sẽ tải lại trạng thái mới nhất thay vì dùng cache cũ.
  const { data: meetingsRaw, isLoading: isMeetingsLoading } = useGetAllMeetingByEmailQuery(user?.email, { skip: !user?.email, refetchOnMountOrArgChange: true })
  const { data: invitedRaw, isLoading: isInvitedLoading } = useGetMeetingInvitedQuery(undefined, { skip: !user?.email, refetchOnMountOrArgChange: true })

  // Gộp cuộc họp mình tổ chức + cuộc họp được mời (đã chấp nhận).
  // Đánh dấu _source để MeetingCard ẩn nút sửa/xóa/mời với cuộc họp được mời.
  // Dedupe theo id, ưu tiên "hosted" để giữ quyền chủ phòng nếu trùng.
  const hosted = (meetingsRaw?.data || []).map((m) => ({ ...m, _source: 'hosted' }))
  const invited = (invitedRaw?.data || []).map((m) => ({ ...m, _source: 'invited' }))
  const byId = new Map()
  for (const m of [...hosted, ...invited]) {
    if (!byId.has(m.id)) byId.set(m.id, m)
  }
  const meetings = [...byId.values()].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  // Lọc theo từ khóa tìm kiếm ở Header (tiêu đề / mô tả / mã phòng).
  const q = search.trim().toLowerCase()
  const filteredMeetings = q
    ? meetings.filter((m) =>
        [m.title, m.description, m.roomCode]
          .filter(Boolean)
          .some((f) => String(f).toLowerCase().includes(q))
      )
    : meetings
  console.log(meetings, 'meetings')

  const numberOfMeetings = meetings?.length || 0
  const waitingCount = meetings?.filter((m) => m.status === 'WaitingForHost')?.length || 0
  const expiredMeetings = meetings.filter((m) => getMeetingState(m) === 'expired').length

  const today = new Date()
  const todayCount = meetings.filter((m) => {
    if (!m.scheduledDateTime) return false
    const d = parseUtc(m.scheduledDateTime)
    return d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
  }).length

  const nextUpcoming = meetings
    .filter((m) => m.scheduledDateTime && getMeetingState(m) === 'upcoming')
    .sort((a, b) => parseUtc(a.scheduledDateTime) - parseUtc(b.scheduledDateTime))[0]

  const hoursUntilNext = nextUpcoming
    ? Math.ceil((parseUtc(nextUpcoming.scheduledDateTime) - new Date()) / 3_600_000)
    : null

  const [jitsiReady, setJitsiReady] = useState(false)
  const [hostEnded, setHostEnded] = useState(false)
  const [isScheduleMeetingModalOpen, setIsScheduleMeetingModalOpen] = useState(false)
  const [isJoinLinkModalOpen, setIsJoinLinkModalOpen] = useState(false)
  const [isWaitingRoomOpen, setIsWaitingRoomOpen] = useState(false)
  const [roomCode, setRoomCode] = useState()
  const [editMeeeting, setEditMeeting] = useState()
  const [deleteMeeting, setDeleteMeeting] = useState()
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false)
  const [deleteMeetingApi, { isLoading: deleteLoading }] = useDeleteMeetingApiMutation()

  const handleJoinLink = async () => {
    setIsJoinLinkModalOpen(true)
  }

  const onHostJoined = async () => {
    setIsWaitingRoomOpen(false)
    navigate(`/meet/${roomCode}`)
  }

  if (isMeetingsLoading || isInvitedLoading) return <Loading text={t('dashboard.loading')} />

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 mx-auto max-w-7xl">

        <h1 className="mb-8 text-3xl font-bold text-[var(--content)]">{t('dashboard.title')}</h1>

        {/* Stat Cards */}
        <div className="flex flex-wrap gap-6 mb-10">
          <StatCard
            icon={<CalendarDays size={28} className="text-white" />}
            label={t('dashboard.stats.numberOfMeetings')}
            value={numberOfMeetings}
            subtext={t('dashboard.stats.thisMonth')}
            color="from-orange-400 to-red-500"
          />
          <StatCard
            icon={<Clock size={28} className="text-white" />}
            label={t('dashboard.stats.rescheduled')}
            value={waitingCount}
            subtext={t('dashboard.stats.thisMonth')}
            color="from-[var(--accent)] to-pink-500"
          />
          <StatCard
            icon={<VideoOff size={28} className="text-white" />}
            label={t('dashboard.stats.cancelled')}
            value={expiredMeetings}
            subtext={t('dashboard.stats.thisMonth')}
            color="from-red-500 to-pink-500"
          />
        </div>


        <div className="grid grid-cols-3 gap-4 mb-10">
          <button
            onClick={() => {
              setType('now')
              setIsScheduleMeetingModalOpen(true)
            }}
            className="flex items-center gap-3 px-6 py-4 font-semibold text-[var(--content)] transition-all transform bg-gradient-to-r from-[var(--accent)] to-[var(--accent)] hover:from-[var(--accent)] hover:to-[var(--accent)] rounded-2xl hover:scale-105"
          >
            <Video className="w-6 h-6" />
            <div className="text-left">
              <div>{t('dashboard.actions.newMeeting')}</div>
              <div className="text-xs font-normal text-white/80">{t('dashboard.actions.newMeetingSubtext')}</div>
            </div>
          </button>

          <button
            onClick={handleJoinLink}
            className="flex items-center gap-3 px-6 py-4 font-semibold text-[var(--content)] transition-all border border-[var(--accent)]/50 hover:border-[var(--accent-fg)] hover:bg-[var(--accent)]/10 rounded-2xl"
          >
            <Plus className="w-6 h-6" />
            <div className="text-left">
              <div>{t('dashboard.actions.joinMeeting')}</div>
              <div className="text-xs font-normal text-[var(--muted)]">{t('dashboard.actions.joinMeetingSubtext')}</div>
            </div>
          </button>

          <button
            onClick={() => {
              setIsScheduleMeetingModalOpen(true)
              setType('schedule')
            }}
            className="flex items-center gap-3 px-6 py-4 font-semibold text-[var(--content)] transition-all border border-[var(--accent)]/50 hover:border-[var(--accent-fg)] hover:bg-[var(--accent)]/10 rounded-2xl"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-2.3-3.04c-.3-.4-.94-.5-1.42-.1-.48.4-.51 1.04-.1 1.42l3 4c.2.28.53.44.88.44.35 0 .68-.16.88-.44l3.85-5.15c.41-.54.34-1.3-.1-1.42-.44-.12-1.11.05-1.42.45z" />
            </svg>
            <div className="text-left">
              <div>{t('dashboard.actions.scheduleMeeting')}</div>
              <div className="text-xs font-normal text-[var(--muted)]">{t('dashboard.actions.scheduleMeetingSubtext')}</div>
            </div>
          </button>
        </div>

        {/* Today's Meetings */}
        <div className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-[var(--content)]">
            {t('dashboard.todayTitle', { count: todayCount })}
          </h2>
          {hoursUntilNext !== null && (
            <p className="text-sm text-[var(--muted)]">
              {t('dashboard.nextMeeting', { hours: hoursUntilNext })}
            </p>
          )}
        </div>

        {/* Meetings Grid — khi tìm kiếm hiển thị tất cả kết quả, ngược lại chỉ 6 cuộc gần nhất */}
        {q && filteredMeetings.length === 0 ? (
          <div className="py-16 text-center text-[var(--muted)]">
            {t('dashboard.noSearchResults', { query: search })}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {(q ? filteredMeetings : filteredMeetings.slice(0, 6)).map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}

        {!q && meetings.length > 6 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => navigate('/meetings')}
              className="flex items-center gap-2 px-6 py-3 font-medium text-[var(--content)] transition-all border border-[var(--accent)]/50 hover:border-[var(--accent-fg)] hover:bg-[var(--accent)]/10 rounded-2xl"
            >
              {t('dashboard.viewMore')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {isScheduleMeetingModalOpen && (
        <ScheduleMeetingModal
          isOpen={isScheduleMeetingModalOpen}
          onClose={() => setIsScheduleMeetingModalOpen(false)}
          hostEmail={user?.email}
          type={type}
          meeting={editMeeeting}
        />
      )}
      {isJoinLinkModalOpen && (
        <JoinLinkModal
          isOpen={isJoinLinkModalOpen}
          onClose={() => setIsJoinLinkModalOpen(false)}
          handleWaiting={() => setIsWaitingRoomOpen(true)}
          pushRoomCode={(rc) => setRoomCode(rc)}
        />
      )}
      {isWaitingRoomOpen && (
        <WaitingRoom
          roomCode={roomCode}
          userName={user.name}
          onCancel={() => setIsWaitingRoomOpen(false)}
          onHostJoined={onHostJoined}
        />
      )}
    </div>
  )
}

export default Dashboard