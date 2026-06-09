// Notification Service chạy ở port 5262 (từ launchSettings.json)
const NOTI_BASE = import.meta.env.VITE_NOTI_API_URL
  ? `${import.meta.env.VITE_NOTI_API_URL}/api/notification`
  : "http://localhost:5555/api/notification";

// Meeting Service chạy ở port 5555
const MEETING_BASE = import.meta.env.VITE_MEETING_API_URL
  ? `${import.meta.env.VITE_MEETING_API_URL}/api/meeting`
  : "http://localhost:5555/api/meeting";

// ── Notification API ─────────────────────────────────────────────────────────

/** GET /api/notification — lấy tất cả notification của user hiện tại (email lấy từ JWT) */
export const getNotifications = (token) =>
  fetch(NOTI_BASE, {
    headers: { Authorization: `Bearer ${token}` },
  });

/** PUT /api/notification/read-all */
export const markAllAsRead = (token) =>
  fetch(`${NOTI_BASE}/read-all`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

/** PUT /api/notification/{id}/read */
export const markOneAsRead = (id, token) =>
  fetch(`${NOTI_BASE}/${id}/read`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

/** GET /api/meeting/{roomCode}/status — lấy trạng thái phòng (isEnded, status, ...) */
export const getMeetingStatus = (roomCode, token) =>
  fetch(`${MEETING_BASE}/${roomCode}/status`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

// ── Meeting Invite API ────────────────────────────────────────────────────────


export const sendInvites = (roomCode, inviteeEmails, token) =>
  fetch(`${MEETING_BASE}/${roomCode}/invite`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inviteeEmails }),
  });

/**
 * Invitee chấp nhận lời mời.
 * POST /api/meeting/invite/{inviteId}/respond
 * body: { status: "Accepted" }
 */
export const acceptInvite = (inviteId, token) =>
  fetch(`${MEETING_BASE}/invite/${inviteId}/respond`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "Accepted" }),
  });

/**
 * Invitee từ chối lời mời.
 * POST /api/meeting/invite/{inviteId}/respond
 * body: { status: "Declined" }  // backend chỉ chấp nhận "Accepted" | "Declined"
 */
export const rejectInvite = (inviteId, token) =>
  fetch(`${MEETING_BASE}/invite/${inviteId}/respond`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "Declined" }),
  });
